import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../NavBar';
import Footer from '../Footer';
import { getUser } from '../utils/auth';
import { formatCurrencyIDR } from '../utils/format';
import { getAllHousingAds } from '../services/housingAd';

const ListingCard = ({ item }) => (
    <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col hover:shadow-lg transition-shadow">
        <div className="mb-2">
            <span className={`text-xs px-2 py-1 rounded ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {item.status}
            </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description || '—'}</p>
        <div className="space-y-1 mb-3">
            <div className="text-sm text-gray-700">
                <span className="text-gray-500">📍 Location:</span> {item.city || item.address}
            </div>
            <div className="text-sm text-gray-700">
                <span className="text-gray-500">📐 Size:</span> {item.land_size_sqm}m² land, {item.building_size_sqm}m² building
            </div>
            <div className="text-sm text-gray-700">
                <span className="text-gray-500">🏠 Specs:</span> {item.bedrooms} bed • {item.bathrooms} bath • {item.garage_capacity || 0} garage
            </div>
            {item.facilities && (
                <div className="text-sm text-gray-700">
                    <span className="text-gray-500">✨ Facilities:</span> {item.facilities}
                </div>
            )}
        </div>
        <div className="mt-auto pt-3 border-t">
            <p className="text-xl font-bold text-[#395192] mb-1">{formatCurrencyIDR(item.price)}</p>
            <p className="text-xs text-gray-500">📞 Contact: {item.contact_phone}</p>
        </div>
    </div>
);

export default function Listings() {
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minBedrooms, setMinBedrooms] = useState('');
    const [showMyListings, setShowMyListings] = useState(false);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const result = await getAllHousingAds({ status: 'active' });
                if (result.success && result.data) {
                    const sorted = result.data.sort((a, b) => 
                        new Date(b.created_at) - new Date(a.created_at)
                    );
                    setListings(sorted);
                }
            } catch (err) {
                console.error('Failed to fetch listings:', err);
                alert('Failed to load listings.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchListings();
    }, []);

    useEffect(() => {
        let filtered = listings;

        // Filter by ownership
        if (showMyListings && user) {
            filtered = filtered.filter(l => l.user_id === user.user_id);
        } else if (user) {
            // Show other people's listings
            filtered = filtered.filter(l => l.user_id !== user.user_id);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(l => 
                (l.title || '').toLowerCase().includes(query) ||
                (l.description || '').toLowerCase().includes(query) ||
                (l.city || '').toLowerCase().includes(query) ||
                (l.address || '').toLowerCase().includes(query)
            );
        }

        // City filter
        if (cityFilter) {
            const city = cityFilter.toLowerCase();
            filtered = filtered.filter(l => 
                (l.city || '').toLowerCase().includes(city) ||
                (l.address || '').toLowerCase().includes(city)
            );
        }

        // Price filters
        if (minPrice) {
            filtered = filtered.filter(l => l.price >= Number(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(l => l.price <= Number(maxPrice));
        }

        // Bedrooms filter
        if (minBedrooms) {
            filtered = filtered.filter(l => l.bedrooms >= Number(minBedrooms));
        }

        setFilteredListings(filtered);
    }, [listings, searchQuery, cityFilter, minPrice, maxPrice, minBedrooms, showMyListings, user]);

    const clearFilters = () => {
        setSearchQuery('');
        setCityFilter('');
        setMinPrice('');
        setMaxPrice('');
        setMinBedrooms('');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <NavBar />
            
            <main className="flex-1">
                {/* Header Section */}
                <section className="bg-[#395192] text-white py-12 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Property Marketplace</h1>
                                <p className="text-lg text-gray-200">
                                    {showMyListings ? 'Manage your property listings' : 'Browse available properties'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    to="/create-listing"
                                    className="bg-[#8F333E] text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition duration-300 shadow-lg"
                                >
                                    + Create New Listing
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filter Section */}
                <section className="py-6 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <div className="bg-white border rounded-xl shadow-sm p-4 md:p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowMyListings(!showMyListings)}
                                        className={`px-4 py-2 rounded-md font-medium transition ${
                                            showMyListings 
                                                ? 'bg-[#395192] text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {showMyListings ? 'Show All Listings' : 'Show My Listings'}
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, description..."
                                    className="md:col-span-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
                                />
                                <input
                                    type="text"
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    placeholder="City / Location"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
                                />
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="Min Price (IDR)"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
                                />
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Max Price (IDR)"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
                                />
                                <input
                                    type="number"
                                    value={minBedrooms}
                                    onChange={(e) => setMinBedrooms(e.target.value)}
                                    placeholder="Min Bedrooms"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
                                />
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mb-4">
                            <p className="text-gray-600">
                                {loading ? 'Loading...' : `Showing ${filteredListings.length} listing${filteredListings.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>

                        {/* Listings Grid */}
                        {loading ? (
                            <div className="bg-white border rounded-xl shadow-sm p-12 text-center">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                </div>
                                <p className="text-gray-600 mt-4">Loading listings...</p>
                            </div>
                        ) : filteredListings.length === 0 ? (
                            <div className="bg-white border rounded-xl shadow-sm p-12 text-center">
                                <div className="text-6xl mb-4">🏠</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {showMyListings ? 'No listings yet' : 'No listings found'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {showMyListings 
                                        ? 'Create your first listing to get started!' 
                                        : 'Try adjusting your filters or check back later.'}
                                </p>
                                {showMyListings && (
                                    <Link
                                        to="/create-listing"
                                        className="inline-block bg-[#395192] text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition"
                                    >
                                        Create Your First Listing
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.map((listing) => (
                                    <ListingCard key={listing.ad_id} item={listing} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
