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
                    {user && (
                        <>
                            <Link to="/listings" className="text-lg hover:text-[#CCCCCC] transition duration-200">
                                Listings
                            </Link>
                            <Link to="/create-listing" className="text-lg hover:text-[#CCCCCC] transition duration-200">
                                Create Listing
                            </Link>
                            <Link to="/my-listings" className="text-lg hover:text-[#CCCCCC] transition duration-200">
                                My Listings
                            </Link>
                        </>
                    )}
                </div>

                {/* Right Links */}
                <div className="flex gap-4 items-center">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-lg hover:text-[#CCCCCC] transition duration-200">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-lg bg-[#8F333E] text-white font-semibold px-5 py-2 rounded-md hover:opacity-90 transition duration-200"
                            >
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="hidden sm:inline text-sm text-gray-200">{user.email || user.name}</span>
                            <button onClick={onLogout} className="text-lg bg-[#8F333E] text-white font-semibold px-4 py-1.5 rounded-md hover:opacity-90 transition duration-200">Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
