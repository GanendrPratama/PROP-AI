import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../NavBar';
import Footer from '../Footer';

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
                        <p className="text-xl mb-8 text-gray-200">
                            Get accurate property valuations powered by artificial intelligence. 
                            Make informed decisions with our advanced pricing algorithm.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                to="/calculation"
                                className="bg-[#8F333E] text-white font-bold py-4 px-8 rounded-lg text-lg hover:opacity-90 transition duration-300 shadow-lg"
                            >
                                Get Started
                            </Link>
                            <Link
                                to="/login"
                                className="bg-white text-[#395192] font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-200 transition duration-300 shadow-lg"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white bg-opacity-10 p-8 rounded-lg backdrop-blur-sm">
                            <svg className="w-full h-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="50" y="80" width="300" height="180" fill="#8F333E" opacity="0.8"/>
                                <rect x="80" y="50" width="240" height="200" fill="#FFFFFF" opacity="0.9"/>
                                <rect x="100" y="80" width="80" height="80" fill="#395192"/>
                                <rect x="220" y="80" width="80" height="80" fill="#395192"/>
                                <rect x="160" y="180" width="80" height="60" fill="#8F333E"/>
                            </svg>
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
            title: 'AI-Powered Analysis',
            description: 'Our advanced machine learning algorithms analyze thousands of data points to provide accurate property valuations.',
            icon: '🤖'
        },
        {
            title: 'Instant Results',
            description: 'Get your property valuation in seconds. No waiting, no hassle.',
            icon: '⚡'
        },
        {
            title: 'Market Insights',
            description: 'Understand market trends and comparable properties in your area.',
            icon: '📊'
        },
        {
            title: 'Detailed Reports',
            description: 'Receive comprehensive reports with price breakdowns and analysis.',
            icon: '📋'
        }
    ];

    return (
    <section className="py-20 px-4 bg-[#CCCCCC]">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#395192] mb-4">Why Choose PROP-AI?</h2>
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
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
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
            number: '1',
            title: 'Enter Property Details',
            description: 'Provide information about your property including location, size, and features.'
        },
        {
            number: '2',
            title: 'AI Analysis',
            description: 'Our AI analyzes your property against market data and trends.'
        },
        {
            number: '3',
            title: 'Get Results',
            description: 'Receive an accurate valuation with detailed insights and recommendations.'
        }
    ];

    return (
        <section id="how-it-works" className="py-20 px-4 bg-white">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#395192] mb-4">How It Works</h2>
                    <p className="text-xl text-gray-600">
                        Simple, fast, and accurate
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="text-center">
                            <div className="mx-auto bg-[#8F333E] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                                {step.number}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h3>
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
                <h2 className="text-4xl font-bold mb-4">Ready to Value Your Property?</h2>
                <p className="text-xl mb-8">
                    Join thousands of users who trust PROP-AI for accurate property valuations.
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
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <NavBar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <CTASection />
            <Footer />
        </div>
    );
}
