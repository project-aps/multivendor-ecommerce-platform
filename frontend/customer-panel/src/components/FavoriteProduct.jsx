import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddToCartBtn from "./AddToCartBtn";
import FormattedPrice from "./FormattedPrice";
import { useDispatch } from "react-redux";
import { removeFromFavorite } from "../redux/slices/favoriteProductSlice";

const FavoriteProduct = ({ product }) => {
    // const { removeFromFavorite } = store();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    return (
        <div className="flex py-6">
            <div className="min-w-0 flex-1 lg:flex lg:flex-col">
                <div className="lg:flex-1">
                    <div className="sm:flex">
                        <div>
                            <h4 className="font-medium text-gray-900">
                                {product?.product_name}
                            </h4>
                            <p className="mt-2 hidden text-sm text-gray-500 sm:block">
                                {product?.vendor_name}
                            </p>
                            {/* <p className="text-sm mt-1">
                                Brand:{" "}
                                <span className="font-medium">
                                    {product?.brand}
                                </span>
                            </p> */}
                            {/* <p className="text-sm mt-1">
                                Category:{" "}
                                <span className="font-medium">
                                    {product?.category}
                                </span>
                            </p> */}
                        </div>
                        <span
                            onClick={() => {
                                dispatch(
                                    removeFromFavorite(product?.product_id)
                                );
                                toast.success(
                                    "Removed from favorite successfully!"
                                );
                            }}
                            className="text-lg text-gray-600 hover:text-red-600 duration-200 cursor-pointer inline-block mt-4 sm:mt-0"
                        >
                            <MdClose />
                        </span>
                    </div>
                    <div className="flex text-sm items-center gap-6 font-medium py-4">
                        <AddToCartBtn product={product} className="w-32" />
                    </div>
                </div>
                <p>
                    You are saving{" "}
                    <span className="text-sm font-semibold text-green-500">
                        <FormattedPrice
                            amount={product?.old_price - product?.current_price}
                        />
                    </span>{" "}
                    upon purchase
                </p>
            </div>
            <div
                onClick={() => navigate(`/product/${product?.product_id}`)}
                className="ml-4 flex-shrink-0 h-20 w-20 sm:w-40 sm:h-40 sm:order-first sm:m-0 sm:mr-6 border border-gray-200 rounded-md hover:border-skyText duration-200 cursor-pointer group overflow-hidden"
            >
                <img
                    src={product?.thumbnail_url}
                    alt="productImage"
                    className="h-full w-full rounded-lg object-contain object-center group-hover:scale-110 duration-200"
                />
            </div>
        </div>
    );
};

export default FavoriteProduct;
