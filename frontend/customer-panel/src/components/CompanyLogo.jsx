import { Link } from "react-router-dom";

const CompanyLogo = () => {
    return (
        <div>
            <Link to="/" className="font-bold dark:text-white text-4xl">
                <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
                    Pa
                </span>
                <span className="text-black">सल</span>
            </Link>
        </div>
    );
};

export default CompanyLogo;
