import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AvatarDropdown = ({ name, profileLink, logoutLink }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        navigate(profileLink);
    };

    const handleLogoutClick = () => {
        navigate(logoutLink);
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            <div
                onClick={toggleDropdown}
                className="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full cursor-pointer"
            >
                <span className="text-lg font-semibold">
                    {name.charAt(0).toUpperCase()}
                </span>
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <button
                        onClick={handleProfileClick}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm w-full text-left"
                    >
                        My Profile
                    </button>
                    <button
                        onClick={handleLogoutClick}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm w-full text-left"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvatarDropdown;
