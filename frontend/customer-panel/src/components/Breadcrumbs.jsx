import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const Breadcrumbs = ({ crumbs }) => {
    return (
        <nav className="w-full flex items-center space-x-2 text-gray-600">
            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <FaChevronRight className="text-xs" /> // Arrow icon between crumbs
                    )}
                    {index === crumbs.length - 1 ? (
                        <span className="font-semibold text-blue-600">
                            {crumb.label}
                        </span> // Last crumb is not a link
                    ) : (
                        <Link to={crumb.path} className="hover:underline">
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
