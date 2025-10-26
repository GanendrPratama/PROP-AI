import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full p-6 bg-white border-t border-[#CCCCCC]">
            <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gray-700">
                <Link to="/contact" className="text-base sm:text-lg text-[#395192] font-semibold hover:underline transition duration-200">
                    Contact Us
                </Link>
                <Link to="/privacy" className="text-base sm:text-lg text-[#395192] font-semibold hover:underline transition duration-200">
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
