import React from "react";

const Avatar = ({ name }) => {
    // Get the first letter of the name
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-lg">
            {initial}
        </div>
    );
};

export default Avatar;
