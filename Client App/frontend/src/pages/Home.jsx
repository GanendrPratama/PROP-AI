import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../NavBar";
import Footer from "../Footer";
import { getUser } from "../utils/auth";
import { formatCurrencyIDR } from "../utils/format";
import { getAllHousingAds } from "../services/housingAd";
import Logo from "../assets/logoPROP-AI.png";

const INPUT_CLASS =
  "w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";


// --- Hero Section ---
const HeroSection = () => {
  return (
    <section className="bg-[#395192] text-white py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6">
              Predict Your Property Value with AI
            </h1>
            <p className="text-xl mb-8 text-gray-200 animated-typing">
              Get accurate property valuations powered by artificial
              intelligence. Make informed decisions with our advanced pricing
              algorithm.
            </p>
            <div className="flex gap-4">
              {/* Tombol Get Started */}
              <Link
                to="/calculation"
                className="bg-[#8F333E] text-white font-bold py-4 px-8 rounded-lg text-lg shadow-md border-2 border-[#8F333E] transform transition-all duration-300 hover:bg-white hover:text-[#8F333E] hover:scale-105 hover:shadow-xl"
              >
                Get Started
              </Link>

              {/* Tombol Sign In */}
              <Link
                to="/login"
                className="bg-white text-[#395192] font-bold py-4 px-8 rounded-lg text-lg shadow-md border border-gray-200 transform transition-all duration-300 hover:bg-[#395192] hover:text-white hover:shadow-xl hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-10 p-8 rounded-lg backdrop-blur-sm flex justify-center items-center">
              <img
                src={Logo}
                alt="PROP-AI Logo"
                className="w-full h-auto max-w-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Features Section ---
const FeaturesSection = () => {
  const features = [
    {
      title: "AI-Powered Analysis",
      description:
        "Our advanced machine learning algorithms analyze thousands of data points to provide accurate property valuations.",
      icon: "🤖",
    },
    {
      title: "Instant Results",
      description:
        "Get your property valuation in seconds. No waiting, no hassle.",
      icon: "⚡",
    },
    {
      title: "Market Insights",
      description:
        "Understand market trends and comparable properties in your area.",
      icon: "📊",
    },
    {
      title: "Detailed Reports",
      description:
        "Receive comprehensive reports with price breakdowns and analysis.",
      icon: "📋",
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#CCCCCC]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#395192] mb-4">
            Why Choose PROP-AI?
          </h2>
          <p className="text-xl text-gray-600">
            Experience the future of property valuation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#8F333E] hover:shadow-2xl transition duration-300 transform hover:-translate-y-2"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- How It Works Section ---
const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Enter Property Details",
      description:
        "Provide information about your property including location, size, and features.",
    },
    {
      number: "2",
      title: "AI Analysis",
      description:
        "Our AI analyzes your property against market data and trends.",
    },
    {
      number: "3",
      title: "Get Results",
      description:
        "Receive an accurate valuation with detailed insights and recommendations.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#395192] mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">Simple, fast, and accurate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto bg-[#8F333E] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/calculation"
            className="inline-block bg-[#395192] text-white font-bold py-4 px-10 rounded-lg text-lg hover:opacity-90 transition duration-300 shadow-lg"
          >
            Start Your Valuation
          </Link>
        </div>
      </div>
    </section>
  );
};

// --- CTA Section ---
const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-[#395192] text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Value Your Property?
        </h2>
        <p className="text-xl mb-8">
          Join thousands of users who trust PROP-AI for accurate property
          valuations.
        </p>
        <Link
          to="/calculation"
          className="inline-block bg-white text-[#395192] font-bold py-4 px-10 rounded-lg text-lg hover:bg-gray-200 transition duration-300 shadow-lg"
        >
          Get Your Free Valuation
        </Link>
      </div>
    </section>
  );
};

// --- Main Home Component ---
export default function Home() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    setUser(getUser());
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await getAllHousingAds();
      if (response.success && response.data) {
        // Sort by created date, newest first
        const sortedListings = response.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setListings(sortedListings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const visibleListings = useMemo(() => {
    // show other people's ads when logged in; otherwise show all
    const base = user
      ? listings.filter((l) => l?.user_id !== user?.user_id)
      : listings;

    return base.filter((l) => {
      const title = (l.title || "").toLowerCase();
      const desc = (l.description || "").toLowerCase();
      const loc = (l.city || l.address || "").toLowerCase();
      const price = Number(l.price || 0);
      const beds = Number(l.bedrooms || 0);

      if (
        q &&
        !(
          title.includes(q.toLowerCase()) ||
          desc.includes(q.toLowerCase()) ||
          loc.includes(q.toLowerCase())
        )
      ) {
        return false;
      }
      if (location && !loc.includes(location.toLowerCase())) return false;
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      if (minBedrooms && beds < Number(minBedrooms)) return false;
      return true;
    });
  }, [user, listings, q, minPrice, maxPrice, minBedrooms, location]);

  return (
    <div className="flex flex-col min-h-screen font-sans w-full">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MarketplaceSection
        user={user}
        listings={visibleListings}
        loading={loading}
        q={q}
        setQ={setQ}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        minBedrooms={minBedrooms}
        setMinBedrooms={setMinBedrooms}
        location={location}
        setLocation={setLocation}
      />
      <CTASection />
      <Footer />
    </div>
  );

}

// --- Marketplace (Listings) Section ---
const Card = ({ item }) => {
  const primaryImage = item.images?.find(img => img.is_primary)?.cloudinary_url || 
                       item.images?.[0]?.cloudinary_url;
  
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {primaryImage && (
        <img 
          src={primaryImage} 
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {item.description || "—"}
        </p>
        <div className="text-sm text-gray-700 mb-1">
          <span className="text-gray-500">Location:</span> {item.city || item.address || "—"}
        </div>
        <div className="text-sm text-gray-700 mb-1">
          <span className="text-gray-500">Bedrooms:</span> {item.bedrooms ?? "—"}
        </div>
        <div className="text-sm text-gray-700 mb-1">
          <span className="text-gray-500">Building:</span> {item.building_size_sqm ?? "—"} m²
        </div>
        <p className="text-base font-bold text-gray-900 mt-auto">
          {formatCurrencyIDR(item.price)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Contact: {item.contact_phone || "—"}
        </p>
      </div>
    </div>
  );
};

const MarketplaceSection = ({
  user,
  listings,
  loading,
  q,
  setQ,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minBedrooms,
  setMinBedrooms,
  location,
  setLocation,
}) => {
  return (
    <section className="py-16 px-4 bg-[#f5f7fb]">
      <div className="container mx-auto max-w-7xl">
        {/* Header dengan Marketplace di tengah */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6">
          {/* Left empty on desktop to help center the title */}
          <div className="hidden md:block" />

          {/* Centered title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#395192]">Marketplace</h2>
            <p className="text-gray-600 mt-1">
              {user
                ? "Browse other people's listings"
                : "Browse public listings"}
            </p>
          </div>

          {/* Actions (right on desktop, centered on mobile) */}
          <div className="flex gap-3 justify-center md:justify-end flex-wrap">
            <Link
              to="/create-listing"
              className="px-4 py-2 rounded-lg font-semibold transition duration-300 border-2 border-transparent bg-[#395192] text-white hover:bg-white hover:text-[#395192] hover:border-[#395192] focus:outline-none focus:ring-2 focus:ring-[#395192] focus:ring-offset-2"
            >
              + Create Listing
            </Link>
            <Link
              to="/my-listings"
              className="px-4 py-2 rounded-lg font-semibold transition duration-300 border-2 border-[#395192] bg-white text-[#395192] hover:bg-[#395192] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#395192] focus:ring-offset-2"
            >
              My Listings
            </Link>
          </div>
        </div>

        {/* Search / Filters */}
        <div className="bg-white border rounded-xl shadow-sm p-4 md:p-6 mb-6">
          {/* Top row: 3 kolom pada md+ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title/description/location"
              className={`${INPUT_CLASS}`}
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location contains…"
              className={`${INPUT_CLASS}`}
            />
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min Price"
              className={`${INPUT_CLASS}`}
            />
          </div>

          {/* Bottom row: 2 kolom pada md+ */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max Price"
              className={`${INPUT_CLASS}`}
            />
            <input
              type="number"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              placeholder="Min Bedrooms"
              className={`${INPUT_CLASS}`}
            />
          </div>
        </div>

        {/* Listing grid */}
        {loading ? (
          <div className="bg-white border rounded-xl shadow-sm p-6 text-center text-gray-700">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#395192]"></div>
            <p className="mt-2">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border rounded-xl shadow-sm p-6 text-gray-700">
            No listings found. Try adjusting your filters or create a listing.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <Card key={l.ad_id} item={l} />
            ))}
          </div>
        )}
      </div>
    </section>
  );

};
