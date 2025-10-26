export const formatCurrencyIDR = (value) => {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
  } catch {
    return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
  }
}

export const percent = (v, digits = 0) => `${(v * 100).toFixed(digits)}%`

export const safeGet = (obj, key, fallback = '-') => (obj && key in obj ? obj[key] : fallback)
