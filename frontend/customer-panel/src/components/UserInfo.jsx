import toast from "react-hot-toast";
import Container from "./Container";
import { Link } from "react-router-dom";

const UserInfo = ({ currentUser }) => {
    console.log(currentUser);

    return (
        <Container className="py-5 text-white">
            <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-16">
                <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-10">
                    <img
                        src={
                            currentUser?.avatar
                                ? currentUser?.avatar
                                : "https://i.ibb.co/mJRkRRV/png-clipart-profile-logo-computer-icons-user-user-blue-heroes-thumbnail.png"
                        }
                        alt="userImage"
                        className="w-40 h-40 rounded-full border border-gray-700 object-cover p-1"
                    />
                    <div className="text-start flex-1">
                        <h2 className="text-xl font-bold tracking-tight sm:text-4xl">
                            Welcome back,{" "}
                            <span className="underline underline-offset-2 decoration-[1px] font-medium">
                                {currentUser?.name}
                            </span>
                        </h2>
                        <div className="text-start mt-6 max-w-3xl text-base leading-6 text-gray-300">
                            <p>Name : {currentUser.name}</p>
                            <p>Email : {currentUser.email}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-col">
                    <div className="mt-10 flex items-center gap-x-5 px-4">
                        <button
                            onClick={() =>
                                toast.error(
                                    "Edit profile option available to pro version!"
                                )
                            }
                            className="rounded-md bg-white px-8 py-2.5 text-sm font-semibold  text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                            Edit profile
                        </button>

                        <Link to={"/logout"}>
                            <button className="rounded-md bg-white px-8 py-2.5 text-sm font-semibold  text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                Logout
                            </button>
                        </Link>
                    </div>
                    <div className="mt-10 flex items-center gap-x-5 px-4">
                        <Link to={"/address"}>
                            <button className="rounded-md bg-white px-8 py-2.5 text-sm font-semibold  text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                Address
                            </button>
                        </Link>

                        <Link to={"/orders"}>
                            <button className="rounded-md bg-white px-8 py-2.5 text-sm font-semibold  text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                Orders
                            </button>
                        </Link>

                        <Link to={"/pending-reviews"}>
                            <button className="rounded-md bg-white px-8 py-2.5 text-sm font-semibold  text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                Pending Reviews
                            </button>
                        </Link>
                        <Link to={"/user-reviews"}>
                            <button className="rounded-md bg-white px-8 py-2.5 text-sm font-semibold  text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                My Reviews
                            </button>
                        </Link>
                    </div>
                </div>
                <svg
                    viewBox="0 0 1024 1024"
                    className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
                    aria-hidden="true"
                >
                    <circle
                        cx={512}
                        cy={512}
                        r={512}
                        fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
                        fillOpacity="0.7"
                    />
                    <defs>
                        <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                            <stop stopColor="#7775D6" />
                            <stop offset={1} stopColor="#E935C1" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>
        </Container>
    );
};

export default UserInfo;
