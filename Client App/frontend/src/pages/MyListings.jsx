import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../NavBar'
import Footer from '../Footer'
import { formatCurrencyIDR } from '../utils/format'
import { getUser } from '../utils/auth'
import { getHousingAdsByUserId, deleteHousingAd } from '../services/housingAd'

export default function MyListings() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    // Check authentication
    useEffect(() => {
        const currentUser = getUser()
        if (!currentUser || !currentUser.user_id) {
            navigate('/login')
            return
        }
        setUser(currentUser)
    }, [navigate])

    // Fetch listings
    useEffect(() => {
        if (!user || !user.user_id) return
        
        const fetchListings = async () => {
            try {
                setLoading(true)
                const result = await getHousingAdsByUserId(user.user_id)
                if (result.success && result.data) {
                    setListings(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch listings:', err)
                alert('Failed to load listings.')
            } finally {
                setLoading(false)
            }
        }
        
        fetchListings()
    }, [user])

    const remove = async (id) => {
        if (!confirm('Are you sure you want to delete this listing?')) return
        
        try {
            const result = await deleteHousingAd(id)
            if (result.success) {
                setListings(listings.filter((l) => l.ad_id !== id))
                alert('Listing deleted successfully!')
            } else {
                alert(result.message || 'Failed to delete listing.')
            }
        } catch (err) {
            console.error('Failed to delete listing:', err)
            alert('Failed to delete listing.')
        }
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
                        {loading ? (
                            <div className="bg-white border rounded-xl shadow-sm p-6 text-gray-700 text-center">Loading your listings...</div>
                        ) : listings.length === 0 ? (
                            <div className="bg-white border rounded-xl shadow-sm p-6 text-gray-700">You have no listings yet. Create one now.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {listings.map((l) => (
                                    <div key={l.ad_id} className="bg-white border rounded-xl shadow-sm p-4 flex flex-col">
                                        <div className="mb-2">
                                            <span className={`text-xs px-2 py-1 rounded ${l.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {l.status}
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">{l.title}</h2>
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{l.description || '—'}</p>
                                        <div className="text-sm text-gray-700 mb-2">
                                            <span className="text-gray-500">Location:</span> {l.city || l.address}
                                        </div>
                                        <div className="text-sm text-gray-700 mb-2">
                                            <span className="text-gray-500">Size:</span> {l.land_size_sqm}m² land, {l.building_size_sqm}m² building
                                        </div>
                                        <div className="text-sm text-gray-700 mb-2">
                                            <span className="text-gray-500">Specs:</span> {l.bedrooms} bed, {l.bathrooms} bath
                                        </div>
                                        <div className="mt-auto pt-2 border-t">
                                            <p className="text-base font-bold text-gray-900">Price: {formatCurrencyIDR(l.price)}</p>
                                            <p className="text-xs text-gray-500 mt-1">Contact: {l.contact_phone}</p>
                                        </div>
                                        <button onClick={() => remove(l.ad_id)} className="mt-3 text-red-600 border border-red-200 rounded-md px-3 py-1 hover:bg-red-50">Remove</button>
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
