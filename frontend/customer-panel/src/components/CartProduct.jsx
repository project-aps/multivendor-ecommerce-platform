import { Link } from "react-router-dom";
import FormattedPrice from "./FormattedPrice";
import AddToCartBtn from "./AddToCartBtn";
import { IoClose } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { deleteProductFromCartAsync } from "../redux/slices/cartSlice";

const CartProduct = ({ product, setRefreshCart }) => {
    const dispatch = useDispatch();

    const handleRemoveProduct = () => {
        if (product) {
            dispatch(
                deleteProductFromCartAsync({
                    product_id: product.product_id,
                })
            ).then(
                () => toast.success("Product removed from cart successfully!"),
                setRefreshCart(true)
            );
        }
    };
    return (
        <div className="flex py-6 sm:py-10">
            <Link to={`/product/${product?.product_id}`}>
                <img
                    src={product?.thumbnail_url}
                    alt="productImage"
                    className="h-24 w-24 rounded-md object-contain object-center sm:h-48 sm:w-48 border border-skyText/30 hover:border-skyText duration-300"
                />
            </Link>
            <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div className="relative pr-9 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:pr-0">
                    <div className="flex flex-col gap-1 col-span-3">
                        <h3 className="text-base font-semibold w-full">
                            {product?.product_name.substring(0, 80)}
                        </h3>
                        <p className="text-xs">
                            Brand:{" "}
                            <span className=" font-medium">
                                {product?.brand_name}
                            </span>
                        </p>
                        <p className="text-xs">
                            Category:{" "}
                            <span className="font-medium">
                                {product?.subcategory_name}
                            </span>
                        </p>

                        <div className="flex items-center gap-6 mt-2">
                            <p className="text-base font-semibold">
                                <FormattedPrice
                                    amount={
                                        product?.current_price *
                                        product?.quantity
                                    }
                                />
                            </p>
                            <AddToCartBtn product={product} showPrice={false} />
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="absolute right-0 top-0">
                            <button
                                onClick={handleRemoveProduct}
                                className="-m2 inline-flex p-2 text-gray-600 hover:text-red-600"
                            >
                                <IoClose className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    {product?.product_available && (
                        <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                            <FaCheck className="text-lg text-green-500" />{" "}
                            <span>In Stock</span>
                        </p>
                    )}
                    <p>
                        You are saving{" "}
                        <span className="text-sm font-semibold text-green-500">
                            <FormattedPrice
                                amount={
                                    product?.old_price - product?.current_price
                                }
                            />
                        </span>{" "}
                        upon purchase
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CartProduct;
