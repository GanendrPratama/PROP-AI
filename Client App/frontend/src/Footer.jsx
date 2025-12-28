import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full bg-gradient-to-r from-[#395192] to-[#2d3f6e] text-white mt-0">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Branding */}
                        <div>
                            <h3 className="text-2xl font-bold mb-3 text-white">PROP-AI</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Predict your property's value accurately with advanced AI technology. Get insights into the real estate market today.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                            <div className="space-y-3">
                                <Link 
                                    to="/" 
                                    className="block text-gray-300 hover:text-white transition duration-200 text-sm"
                                >
                                    Home
                                </Link>
                                <Link 
                                    to="/calculation" 
                                    className="block text-gray-300 hover:text-white transition duration-200 text-sm"
                                >
                                    Price Prediction
                                </Link>
                                <Link 
                                    to="/contact" 
                                    className="block text-gray-300 hover:text-white transition duration-200 text-sm"
                                >
                                    Contact Us
                                </Link>
                                <Link 
                                    to="/privacy" 
                                    className="block text-gray-300 hover:text-white transition duration-200 text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Get In Touch</h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Email:</span><br/>
                                        info@prop-ai.com
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Phone:</span><br/>
                                        +62 812 3456 7890
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-500 my-8"></div>

                    {/* Copyright */}
                    <div className="text-center text-gray-300 text-sm">
                        <p>&copy; 2025 PROP-AI. All rights reserved.</p>
                        <p className="text-xs mt-2 text-gray-400">Powered by AI Technology</p>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;