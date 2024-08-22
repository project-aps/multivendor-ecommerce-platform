import { useEffect, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
// import { store } from "../lib/store";
import CartProduct from "../../components/CartProduct";
// import CheckoutBtn from "../../components/CheckoutBtn";
import Container from "../../components/Container";
import FormattedPrice from "../../components/FormattedPrice";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import Breadcrumbs from "../../components/Breadcrumbs";

const breadcrumbsData = [
    {
        label: "Home",
        path: "/",
    },
    {
        label: "Cart",
        path: "/cart",
    },
];

const CartsPage = () => {
    const [refreshCart, setRefreshCart] = useState(false);
    // const [totalAmt, setTotalAmt] = useState({ regular: 0, discounted: 0 });
    const [cartsData, setCartsData] = useState([]);
    const [pricingData, setPricingData] = useState({});

    const [loading, setLoading] = useState(false);
    // const { cartProduct, currentUser } = store();

    const shippingAmt = 25;
    const taxAmt = 15;

    const fetchCarts = async () => {
        setLoading(true);
        try {
            const response = await ordersDeliveryAxios.get("/carts/details");
            if (response.data.success) {
                const products_data =
                    response.data.data.products_vendor_wise.flatMap(
                        (vendor) => vendor.products
                    );
                console.log(products_data);
                setCartsData(products_data);

                // const totals = response.data.data.pricing;
                setPricingData(response.data.data.pricing);
            } else {
                toast.error(response.data.message || "Failed to fetch carts");
            }
        } catch (error) {
            toast.error("An error occurred while fetching carts");
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        // fetch cart data
        fetchCarts();
    }, []);

    useEffect(() => {
        if (refreshCart) {
            setRefreshCart(false);
            fetchCarts();
        }
    }, [refreshCart]);

    // useEffect(() => {
    //     const totals = cartProduct.reduce(
    //         (sum, product) => {
    //             sum.regular += product?.regularPrice * product?.quantity;
    //             sum.discounted += product?.discountedPrice * product?.quantity;
    //             return sum;
    //         },
    //         { regular: 0, discounted: 0 }
    //     );
    //     setTotalAmt(totals);
    // }, [cartProduct]);

    return (
        <div>
            {loading ? (
                <Loading />
            ) : (
                <Container>
                    {cartsData.length > 0 ? (
                        <>
                            {/* Breadcrumbs component */}
                            {breadcrumbsData && (
                                <Breadcrumbs crumbs={breadcrumbsData} />
                            )}
                            <h1 className="text-3xl mt-3 font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Shopping Cart
                            </h1>

                            <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                                {/* cart products */}
                                <section className="lg:col-span-7">
                                    <div className=" divide-y divide-gray-200 border-b border-t border-gray-200">
                                        {cartsData.map((product) => (
                                            <CartProduct
                                                product={product}
                                                key={product?.product_id}
                                                setRefreshCart={setRefreshCart}
                                            />
                                        ))}
                                    </div>
                                </section>
                                {/* order summary */}
                                <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Cart summary
                                    </h2>
                                    <dl className="mt-6 space-y-4">
                                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                            <dt className="text-base font-medium text-gray-900">
                                                Order total
                                            </dt>
                                            <dd className="text-lg font-bold text-gray-900">
                                                <FormattedPrice
                                                    amount={
                                                        pricingData.total_paying_amount
                                                    }
                                                />
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="mt-6 ">
                                        <Link to={"/checkout"}>
                                            <div className="w-full rounded-md border border-transparent bg-gray-800 px-4 py-3 font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-skyText focus:ring-offset-2 focus:ring-offset-gray-50 duration-200 text-2xl text-center ">
                                                Checkout
                                            </div>
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white h-96 flex flex-col gap-2 items-center justify-center py-5 rounded-lg border border-gray-200 drop-shadow-2xl">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Shopping Cart
                            </h1>
                            <p className="text-lg mt-4 max-w-[600px] text-center text-gray-600 tracking-wide leading-6">
                                Your cart is empty.
                            </p>
                            <Link
                                to={"/products"}
                                className="bg-gray-800 text-gray-200 px-8 py-4 rounded-md hover:bg-black hover:text-white duration-200 uppercase text-sm font-semibold tracking-wide"
                            >
                                go to shopping
                            </Link>
                        </div>
                    )}
                </Container>
            )}
        </div>
    );
};

export default CartsPage;
