import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavBar from '../NavBar'
import Footer from '../Footer'
import { formatCurrencyIDR, percent } from '../utils/format'

const Bar = ({ label, value, maxValue }) => {
	const pct = Math.max(2, Math.round((value / Math.max(1, maxValue)) * 100))
	return (
		<div className="mb-3">
			<div className="flex justify-between text-sm text-gray-700 mb-1">
				<span>{label}</span>
				<span>{formatCurrencyIDR(value)}</span>
			</div>
			<div className="w-full bg-gray-100 rounded-full h-3">
				<div className="bg-[#395192] h-3 rounded-full" style={{ width: `${pct}%` }} />
			</div>
		</div>
	)
}

export default function Result() {
	const { state } = useLocation()
	const navigate = useNavigate()

	let input = state?.input
	let result = state?.result

	if (!result) {
		// Try restore from sessionStorage
		try {
			const sIn = sessionStorage.getItem('propai:lastInput')
			const sRes = sessionStorage.getItem('propai:lastResult')
			if (sRes) result = JSON.parse(sRes)
			if (sIn) input = JSON.parse(sIn)
		} catch {}
	}

	if (!result) {
		return (
			<div className="flex flex-col min-h-screen bg-gray-50 w-full">
				<NavBar />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center p-8 bg-white border rounded-lg shadow-sm">
						<h2 className="text-xl font-semibold mb-2">No result to display</h2>
						<p className="text-gray-600 mb-4">Please run a prediction from the Calculation page.</p>
						<button onClick={() => navigate('/calculation')} className="bg-[#395192] text-white px-5 py-2 rounded-md">Go to Calculation</button>
					</div>
				</main>
				<Footer />
			</div>
		)
	}

	const { estimatedPrice, priceFormatted, breakdown = [], importances = {}, currency = 'IDR', model, mostInfluentialFeature } = result
	const maxBreakdown = Math.max(...breakdown.map((b) => b.value), estimatedPrice)

	return (
		<div className="flex flex-col min-h-screen bg-gray-50">
			<NavBar />
			<main className="flex-1">
				<section className="py-6 md:py-10 px-4 md:px-6">
					<div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Summary Card */}
						<div className="lg:col-span-2 bg-white border rounded-xl shadow-sm p-6">
							<h1 className="text-2xl font-bold text-[#395192] mb-3">Estimated Property Price</h1>
							<div className="text-4xl font-extrabold text-gray-900 mb-2">
								{priceFormatted || formatCurrencyIDR(estimatedPrice)} 
								<span className="text-base font-medium text-gray-500"> {currency}</span>
							</div>
							<p className="text-sm text-gray-600 mb-2">Model: {model || '—'}</p>
							{mostInfluentialFeature && (
								<p className="text-sm text-[#8F333E] font-semibold mb-4">
									Most Influential Feature: {mostInfluentialFeature}
								</p>
							)}

							<div className="bg-[#f9fafb] border rounded-lg p-4">
								<h2 className="text-lg font-semibold text-gray-800 mb-3">Feature Contribution to Price</h2>
								{breakdown.length === 0 ? (
									<p className="text-gray-600">No breakdown provided.</p>
								) : (
									<div>
										{breakdown.map((item, idx) => (
											<div key={idx} className="mb-3">
												<div className="flex justify-between text-sm text-gray-700 mb-1">
													<span className="font-medium">{item.label}</span>
													<div className="text-right">
														<span className="block">{formatCurrencyIDR(item.value)}</span>
														<span className="text-xs text-gray-500">{item.percentage?.toFixed(2)}%</span>
													</div>
												</div>
												<div className="w-full bg-gray-100 rounded-full h-3">
													<div 
														className="bg-[#395192] h-3 rounded-full transition-all" 
														style={{ width: `${Math.max(2, Math.round((item.value / Math.max(1, maxBreakdown)) * 100))}%` }} 
													/>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Feature Importance */}
						<aside className="bg-white border rounded-xl shadow-sm p-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4">Feature Importance</h2>
							<div className="space-y-3">
								{Object.keys(importances).length === 0 ? (
									<p className="text-gray-600">No importance data.</p>
								) : (
									Object.entries(importances)
										.sort((a, b) => b[1] - a[1]) // Sort by importance descending
										.map(([k, v]) => (
											<div key={k} className={k === mostInfluentialFeature ? 'bg-red-50 p-2 rounded-md -m-2 mb-1' : ''}>
												<div className="flex justify-between text-sm text-gray-700 mb-1">
													<span className="font-medium capitalize">{k}</span>
													<span className="font-semibold">{percent(v, 2)}</span>
												</div>
												<div className="w-full bg-gray-100 rounded-full h-2">
													<div 
														className={`h-2 rounded-full transition-all ${k === mostInfluentialFeature ? 'bg-[#8F333E]' : 'bg-[#395192]'}`}
														style={{ width: `${Math.min(100, Math.max(3, v * 100))}%` }} 
													/>
												</div>
											</div>
										))
								)}
							</div>

							{/* Input recap */}
							{input && (
								<div className="mt-6">
									<h3 className="text-sm font-semibold text-gray-800 mb-2">Input Summary</h3>
									<div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
										<div><span className="text-gray-500">Location:</span> {input.location}</div>
										<div><span className="text-gray-500">Land Size:</span> {input.landSize} m²</div>
										<div><span className="text-gray-500">Building Area:</span> {input.buildingArea} m²</div>
										<div><span className="text-gray-500">Bedrooms:</span> {input.bedrooms}</div>
										<div><span className="text-gray-500">Bathrooms:</span> {input.bathrooms}</div>
										{input.floors ? <div><span className="text-gray-500">Floors:</span> {input.floors}</div> : null}
										{input.garageCapacity ? <div><span className="text-gray-500">Garage:</span> {input.garageCapacity}</div> : null}
										{input.yearBuilt ? <div><span className="text-gray-500">Year Built:</span> {input.yearBuilt}</div> : null}
										{input.facilities?.length ? (
											<div className="md:col-span-2"><span className="text-gray-500">Facilities:</span> {input.facilities.join(', ')}</div>
										) : null}
									</div>
								</div>
							)}

							<div className="mt-6 flex gap-3">
								<button onClick={() => navigate('/calculation')} className="border border-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-50">New Prediction</button>
								<button onClick={() => window.print()} className="bg-[#395192] text-white px-4 py-2 rounded-md">Print/Save</button>
							</div>
						</aside>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	)
}

