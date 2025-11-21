import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from './utils/auth';

const NavBar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Function to update user state from localStorage
    const updateUserState = () => {
        const currentUser = getUser();
        console.log('NavBar: updateUserState called, user:', currentUser);
        setUser(currentUser);
    };

    useEffect(() => {
        console.log('NavBar: useEffect mounted');
        // Initial load
        updateUserState();

        // Listen for custom login/logout events
        const handleLogin = () => {
            console.log('NavBar: userLoggedIn event received');
            updateUserState();
        };
        const handleLogout = () => {
            console.log('NavBar: userLoggedOut event received');
            updateUserState();
        };

        window.addEventListener('userLoggedIn', handleLogin);
        window.addEventListener('userLoggedOut', handleLogout);

        // Also listen to storage events (for multi-tab support)
        const handleStorageChange = (e) => {
            if (e.key === 'propai:user') {
                updateUserState();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Cleanup
        return () => {
            window.removeEventListener('userLoggedIn', handleLogin);
            window.removeEventListener('userLoggedOut', handleLogout);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const onLogout = () => {
        logout();
        setUser(null);
        navigate('/');
    };

    const navLinkClass = "text-white font-semibold relative group pb-1 transition duration-300 hover:text-[#FFD700] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[#8F333E] after:to-[#FFD700] after:transition-all after:duration-300 group-hover:after:w-full";

    return (
        <nav className="w-full bg-gradient-to-r from-[#395192] via-[#2d3f6e] to-[#395192] text-white shadow-xl sticky top-0 z-50 backdrop-blur-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 group">
                        <h1 className="text-3xl font-bold text-white group-hover:text-[#FFD700] transition duration-300 transform group-hover:scale-110">
                            PROP-AI
                        </h1>
                    </Link>

                    {/* Mid Links */}
                    <div className="hidden md:flex gap-8">
                        <Link to="/" className={navLinkClass}>
                            Home
                        </Link>
                        <Link to="/calculation" className={navLinkClass}>
                            Calculate
                        </Link>
                        {user && (
                            <>
                                <Link to="/create-listing" className={navLinkClass}>
                                    Create Listing
                                </Link>
                                <Link to="/my-listings" className={navLinkClass}>
                                    My Listings
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Right Links */}
                    <div className="flex gap-4 items-center">
                        {!user ? (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-white font-semibold relative group pb-1 transition duration-300 hover:text-[#FFD700] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[#8F333E] after:to-[#FFD700] after:transition-all after:duration-300 group-hover:after:w-full"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-white bg-gradient-to-r from-[#8F333E] to-[#A6434D] font-bold px-6 py-2 rounded-lg hover:from-[#FFD700] hover:to-[#FFA500] hover:text-[#395192] hover:shadow-2xl transition duration-300 transform hover:scale-110 shadow-lg"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline text-sm text-white px-4 py-2 rounded-lg bg-gradient-to-r from-[#2d3f6e] to-[#1a2847] border border-[#FFD700] border-opacity-30">
                                    👤 {user.email || user.name}
                                </span>
                                <button 
                                    onClick={onLogout} 
                                    className="text-[#395192] bg-gradient-to-r from-[#FFD700] to-[#FFA500] font-bold px-6 py-2 rounded-lg hover:from-[#8F333E] hover:to-[#A6434D] hover:text-white hover:shadow-2xl transition duration-300 transform hover:scale-110 shadow-lg"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;