"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ReactPaginate from "react-paginate";
import vendorProductsAxios from "../utils/axios/vendors_products_axios";
import toast from "react-hot-toast";

const Items = ({ currentItems }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentItems &&
                currentItems?.map((item) => (
                    <ProductCard key={item?.product_id} item={item} />
                ))}
        </div>
    );
};

const Pagination = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // setLoading(true);
            try {
                const response = await vendorProductsAxios.get("/products", {
                    params: {
                        vendor_status: "approved",
                        limit: 9,
                        sort: "total_items_sold",
                        order: "DESC",
                    },
                });
                if (response.data.success) {
                    setProducts(response.data.data.products);
                } else {
                    toast.error(
                        response.data.message || "Failed to fetch products"
                    );
                }
            } catch (error) {
                toast.error("An error occurred while fetching products");
                console.error(error);
            }
            // setLoading(false);
        };
        fetchData();
    }, []);

    const itemsPerPage = 9;
    const [itemOffset, setItemOffset] = useState(0);
    const [itemStart, setItemStart] = useState(1);
    const endOffset = itemOffset + itemsPerPage;
    // console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    const currentItems = products.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(products.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % products.length;
        const newStart = newOffset + 1;
        // console.log(
        //   `User requested page number ${event.selected}, which is offset ${newOffset}`
        // );
        setItemOffset(newOffset);
        setItemStart(newStart);
    };

    return (
        <>
            <Items currentItems={currentItems} />
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
                <ReactPaginate
                    nextLabel=""
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={3}
                    marginPagesDisplayed={2}
                    pageCount={pageCount}
                    previousLabel=""
                    pageLinkClassName="w-9 h-9 border[1px] border-lightColor hover:border-gray-500 duration-300 flex justify-center items-center"
                    pageClassName="mr-6"
                    containerClassName="flex text-base font-semibold py-10"
                    activeClassName="bg-black text-white"
                />
                <p>
                    Products from {itemStart} to{" "}
                    {Math.min(endOffset, products?.length)} of{" "}
                    {products?.length}
                </p>
            </div>
        </>
    );
};

export default Pagination;
