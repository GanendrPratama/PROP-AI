import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
    <nav className="w-full bg-[#395192] text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/">
                    <h1 className="text-3xl font-bold text-white hover:text-gray-200 transition duration-200">
                        PROP-AI
                    </h1>
                </Link>

                {/* Mid Links */}
                <div className="hidden md:flex gap-8">
                    <Link to="/" className="text-lg hover:text-[#CCCCCC] transition duration-200">
                        Home
                    </Link>
                    <Link to="/calculation" className="text-lg hover:text-[#CCCCCC] transition duration-200">
                        Calculate
                    </Link>
                </div>

                {/* Right Links */}
                <div className="flex gap-4 items-center">
                    <Link to="/login" className="text-lg hover:text-[#CCCCCC] transition duration-200">
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="text-lg bg-[#8F333E] text-white font-semibold px-5 py-2 rounded-md hover:opacity-90 transition duration-200"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
