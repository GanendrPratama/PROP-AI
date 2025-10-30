import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../NavBar'
import Footer from '../Footer'
import { formatCurrencyIDR } from '../utils/format'
import { getUser } from '../utils/auth'

export default function MyListings() {
    const [listings, setListings] = useState([])
    const user = getUser()

    useEffect(() => {
        try {
            const raw = localStorage.getItem('propai:listings')
            setListings(raw ? JSON.parse(raw) : [])
        } catch {
            setListings([])
        }
    }, [])

    const remove = (id) => {
        const next = listings.filter((l) => l.id !== id)
        setListings(next)
        try {
            localStorage.setItem('propai:listings', JSON.stringify(next))
        } catch { }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <NavBar />
            <main className="flex-1">
                <section className="py-6 md:py-10 px-4 md:px-6">
                    <div className="w-full">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#395192]">My Listings</h1>
                            <Link to="/create-listing" className="bg-[#395192] text-white px-4 py-2 rounded-md hover:opacity-90">+ New Listing</Link>
                        </div>
                        {listings.length === 0 ? (
                            <div className="bg-white border rounded-xl shadow-sm p-6 text-gray-700">You have no listings yet. Create one now.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {listings
                                    .filter((l) => !user || l?.owner?.email === user?.email)
                                    .map((l) => (
                                    <div key={l.id} className="bg-white border rounded-xl shadow-sm p-4 flex flex-col">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">{l.title}</h2>
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{l.description || '—'}</p>
                                        <div className="text-sm text-gray-700 mb-2"><span className="text-gray-500">Location:</span> {l.specs.location}</div>
                                        <div className="mt-auto pt-2 border-t">
                                            {l.suggested ? (
                                                <p className="text-xs text-gray-500">AI suggested: {formatCurrencyIDR(l.suggested)}</p>
                                            ) : null}
                                            <p className="text-base font-bold text-gray-900">Listed Price: {formatCurrencyIDR(l.price)}</p>
                                        </div>
                                        <button onClick={() => remove(l.id)} className="mt-3 text-red-600 border border-red-200 rounded-md px-3 py-1 hover:bg-red-50">Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
