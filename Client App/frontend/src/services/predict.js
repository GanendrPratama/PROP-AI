// Simple prediction service with backend call and a client-side fallback heuristic.

const controllerWithTimeout = (ms = 6000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return { controller, clear: () => clearTimeout(id) }
}

const safeFetch = async (url, options = {}, timeoutMs = 6000) => {
  const { controller, clear } = controllerWithTimeout(timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clear()
    return res
  } catch (e) {
    clear()
    throw e
  }
}

// Fallback heuristic model (for demo/dev when backend isn't available)
const heuristicPredict = (payload) => {
  const nowYear = new Date().getFullYear()
  const age = payload?.yearBuilt ? Math.max(0, nowYear - payload.yearBuilt) : 20
  const basePerM2 = 6000000 // base IDR per m² (hypothetical)
  // Location multiplier: try to detect premium areas
  const locStr = (payload.location || '').toLowerCase()
  let locMultiplier = 1.0
  if (/jakarta|bsd|pakuwon|kemang|pondok indah|senopati/.test(locStr)) locMultiplier = 1.5
  else if (/bandung|dago|pasteur|surabaya|tangerang/.test(locStr)) locMultiplier = 1.25
  else if (/yogyakarta|malang|bekasi|depok/.test(locStr)) locMultiplier = 1.1

  const sizeScore = (payload.landSize || 0) * 0.5 + (payload.buildingArea || 0) * 1.2
  const roomScore = (payload.bedrooms || 0) * 200000000 + (payload.bathrooms || 0) * 150000000
  const floorsBonus = (payload.floors || 0) * 120000000
  const garageBonus = (payload.garageCapacity || 0) * 80000000

  const facilityCount = (payload.facilities || []).length
  const facilityBonus = facilityCount * 100000000

  // Depreciation for age (but not too harsh)
  const ageFactor = Math.max(0.6, 1 - age * 0.01)

  let price = (sizeScore * basePerM2 + roomScore + floorsBonus + garageBonus + facilityBonus) * locMultiplier * ageFactor

  // Extras influence a bit
  if (payload.extras) {
    const keys = Object.keys(payload.extras)
    price *= 1 + Math.min(0.1, keys.length * 0.01)
  }

  // Feature importance (normalized)
  const contributions = {
    location: (locMultiplier - 1) * 0.4 + 0.3, // heuristic scaling
    size: 0.35,
    rooms: 0.15,
    floorsGarage: 0.07,
    age: 0.08,
    facilities: 0.05,
  }

  const sum = Object.values(contributions).reduce((a, b) => a + b, 0)
  const importances = Object.fromEntries(
    Object.entries(contributions).map(([k, v]) => [k, v / sum])
  )

  const breakdown = [
    { label: 'Location', value: price * importances.location },
    { label: 'Size (Land + Building)', value: price * importances.size },
    { label: 'Rooms (Beds/Baths)', value: price * importances.rooms },
    { label: 'Floors/Garage', value: price * importances.floorsGarage },
    { label: 'Age', value: price * importances.age },
    { label: 'Facilities', value: price * importances.facilities },
  ]

  return {
    model: 'heuristic-local',
    currency: 'IDR',
    estimatedPrice: Math.max(150000000, Math.round(price)),
    importances,
    breakdown,
  }
}

export async function predictPrice(payload) {
  // Try backend first (adjust endpoint as needed)
  try {
    const res = await safeFetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      // Expecting { estimatedPrice, breakdown, importances, currency }
      if (data && typeof data.estimatedPrice === 'number') {
        return data
      }
      throw new Error('Invalid response shape')
    }
    throw new Error(`Server error: ${res.status}`)
  } catch {
    // Fallback when backend unavailable
    return heuristicPredict(payload)
  }
}

export default predictPrice
