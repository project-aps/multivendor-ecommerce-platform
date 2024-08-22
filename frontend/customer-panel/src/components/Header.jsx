import { useEffect, useState } from "react";
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
} from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { FiShoppingBag, FiStar, FiUser } from "react-icons/fi";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import Container from "./Container";
import { useSelector } from "react-redux";
import Avatar from "./Avatar";
import CompanyLogo from "./CompanyLogo";
import toast from "react-hot-toast";
// import vendorProductsAxios from "../utils/axios/vendors_products_axios";
import AvatarDropdown from "./AvatarDropDown";
import axios from "axios";
import RightSidebarCart from "../pages/CartsPage/RightSidebarCart";

const bottomNavigation = [
    { title: "Home", link: "/" },
    { title: "Products", link: "/products" },
    { title: "Cart", link: "/cart" },
    { title: "Orders", link: "/orders" },
    { title: "My Account", link: "/profile" },
    // { title: "Blog", link: "/blog" },
];

const Header = () => {
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState("");
    const [categories, setCategories] = useState([]);

    // get user data from auth store
    const { user } = useSelector((state) => state.auth);
    const { totalItems } = useSelector((state) => state.cart);
    const { favoriteProduct } = useSelector((state) => state.favoriteProduct);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        fetchSubcategories();
    }, []);

    // useEffect(() => {
    //   const fetchData = async () => {
    //     const endpoint = `${config?.baseUrl}/products`;
    //     try {
    //       const data = await getData(endpoint);
    //       setProducts(data);
    //     } catch (error) {
    //       console.error("Error fetching data", error);
    //     }
    //   };
    //   fetchData();
    // }, []);

    // useEffect(() => {
    //   const fetchData = async () => {
    //     const endpoint = `${config?.baseUrl}/categories`;
    //     try {
    //       const data = await getData(endpoint);
    //       setCategories(data);
    //     } catch (error) {
    //       console.error("Error fetching data", error);
    //     }
    //   };
    //   fetchData();
    // }, []);

    // useEffect(() => {
    //   const filtered = products.filter((item: ProductProps) =>
    //     item.name.toLowerCase().includes(searchText.toLowerCase())
    //   );
    //   setFilteredProducts(filtered);
    // }, [searchText]);

    const fetchSubcategories = async (categoryId = "") => {
        // setLoading(true);
        try {
            const sub_category_endpoint =
                process.env.REACT_APP_VENDORS_PRODUCTS_BACKEND_API_URL +
                "/api/subcategory";
            const response = await axios.get(sub_category_endpoint, {
                params: categoryId ? { category_id: categoryId } : {},
            });
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error(
                    response.data.message || "Failed to fetch subcategories"
                );
            }
        } catch (error) {
            toast.error("An error occurred while fetching subcategories");
            console.error(error);
        }
        // setLoading(false);
    };

    const handleSearch = () => {
        if (searchText.trim()) {
            const search_text = searchText;
            setSearchText("");

            navigate(`/products?search=${search_text}`);
        }
    };

    return (
        <div className="w-full bg-whiteText">
            {/* <div className="w-full bg-whiteText md:sticky md:top-0 z-50"> */}

            {/* upper nav */}
            <div className="max-w-screen-xl mx-auto h-20 flex items-center justify-between px-4 lg:px-0">
                {/* Logo */}
                <Link to={"/"}>
                    <div className="w-44">
                        <CompanyLogo />
                    </div>
                </Link>
                {/* SearchBar */}
                <div className="hidden h-12 md:inline-flex max-w-3xl w-full relative">
                    <input
                        type="text"
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        value={searchText}
                        placeholder="Search products..."
                        className="w-full flex-1 rounded-full text-xl font-semibold text-gray-900 placeholder:text-xl placeholder:tracking-wide shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 placeholder:font-normal focus:ring-1 focus:ring-darkText  px-4 py-2 "
                    />
                    {searchText ? (
                        <IoClose
                            onClick={() => setSearchText("")}
                            className="absolute top-2.5 right-4 text-xl hover:text-red-500 cursor-pointer duration-200"
                        />
                    ) : (
                        <IoSearchOutline className="absolute top-2.5 right-4 text-xl" />
                    )}
                </div>

                {/* Menubar */}
                <div className="flex items-center gap-x-6 text-2xl">
                    {user ? (
                        <div className="flex gap-4">
                            <Link to={"/profile"}>
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Welcome,
                                    </div>
                                    <div className="font-semibold">
                                        {user.name.split(" ")[0]}
                                    </div>
                                </div>
                            </Link>

                            <div className="w-10 h-10">
                                {/* <Avatar name={user?.name || ""} /> */}
                                <div className="my-2">
                                    <AvatarDropdown
                                        name={user?.name || ""}
                                        profileLink="/profile"
                                        logoutLink="/logout"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <FiUser className="hover:text-skyText duration-200 cursor-pointer" />
                    )}

                    <Link to={"/favorite"} className="relative block">
                        <FiStar className="hover:text-skyText duration-200 cursor-pointer" />
                        <span className="inline-flex items-center justify-center bg-redText text-whiteText absolute -top-1 -right-2 text-[9px] rounded-full w-4 h-4">
                            {favoriteProduct?.length > 0
                                ? favoriteProduct?.length
                                : "0"}
                        </span>
                    </Link>
                    {/*  cart button  */}
                    {/* <Link to={"/cart"} className="relative block">
                        <FiShoppingBag className="hover:text-skyText duration-200 cursor-pointer" />
                        <span className="inline-flex items-center justify-center bg-redText text-whiteText absolute -top-1 -right-2 text-[9px] rounded-full w-4 h-4">
                            {totalItems > 0 ? totalItems : "0"}
                        </span>
                    </Link> */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative block"
                        >
                            <FiShoppingBag className="hover:text-skyText duration-200 cursor-pointer" />
                            <span className="inline-flex items-center justify-center bg-redText text-whiteText absolute -top-1 -right-2 text-[9px] rounded-full w-4 h-4">
                                {totalItems > 0 ? totalItems : "0"}
                            </span>
                        </button>
                        <RightSidebarCart
                            isOpen={isCartOpen}
                            onClose={() => setIsCartOpen(false)}
                        />
                    </div>
                </div>
            </div>
            {/* down navbar  */}
            <div className="w-full bg-darkText text-whiteText">
                <Container className="py-2 max-w-4xl flex items-center gap-5 justify-between">
                    {/* category  */}

                    <Menu>
                        <MenuButton className="inline-flex items-center gap-2 rounded-md border border-gray-400 hover:border-white py-1.5 px-3 font-semibold text-gray-300 hover:text-whiteText">
                            Select Category{" "}
                            <FaChevronDown className="text-base mt-1" />
                        </MenuButton>
                        <Transition
                            enter="transition ease-out duration-75"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <MenuItems
                                anchor="bottom end"
                                className="w-52 origin-top-right rounded-xl border border-white/5 bg-black p-1 text-sm/6 text-gray-300 [--anchor-gap:var(--spacing-1)] focus:outline-none hover:text-white z-50"
                            >
                                {categories.map((item) => (
                                    <MenuItem key={item?.id}>
                                        <Link
                                            to={`/category/${item?.id}`}
                                            className="flex w-full items-center gap-2 rounded-lg py-2 px-3 data-[focus]:bg-white/20 tracking-wide"
                                        >
                                            <img
                                                src={item?.image_src}
                                                alt="categoryImage"
                                                className="w-6 h-6 rounded-md"
                                            />
                                            {item?.name}
                                        </Link>
                                    </MenuItem>
                                ))}
                            </MenuItems>
                        </Transition>
                    </Menu>

                    {/* navigation links */}
                    {bottomNavigation.map(({ title, link }) => (
                        <Link
                            to={link}
                            key={title}
                            className="uppercase hidden md:inline-flex text-sm font-semibold text-whiteText/90 hover:text-whiteText duration-200 relative overflow-hidden group"
                        >
                            {title}
                            <span className="inline-flex w-full h-[1px] bg-whiteText absolute bottom-0 left-0 transform -translate-x-[105%] group-hover:translate-x-0 duration-300" />
                        </Link>
                    ))}
                </Container>
            </div>
        </div>
    );
};

export default Header;
