import { dbQuery } from "../db/db.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

import axios from "axios";
import dotenv from "dotenv";
import { get_shipping_fee } from "../utils/orders_utils.js";
dotenv.config();

// add cart items
export const addCartItem = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { product_id, quantity } = req.body;

        if (!user_id || !product_id || !quantity) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // check if that product and that stock is available or not in product
        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: [product_id],
        });

        if (pd.data.success) {
            const product_details = pd.data.data;
            const product = product_details[0];
            if (product.available_stock < quantity) {
                return sendErrorResponse(res, {
                    statusCode: 400,
                    message: "Product stock is not available",
                });
            }
        } else {
            return sendErrorResponse(res, {
                statusCode: 500,
                message: "Error getting product details",
            });
        }

        // Check if the cart exists for the user
        let cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        // If cart doesn't exist, create a new one
        if (cart.rows.length === 0) {
            const newCart = await dbQuery(
                "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
                [user_id]
            );
            cart = newCart;
        }

        const cart_id = cart.rows[0].id;

        // Check if the product is already in the cart
        const cartItem = await dbQuery(
            "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2",
            [cart_id, product_id]
        );

        if (cartItem.rows.length === 0) {
            // If the product is not in the cart, add it
            await dbQuery(
                "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
                [cart_id, product_id, quantity]
            );
        } else {
            // If the product is already in the cart, update the quantity
            await dbQuery("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
                quantity,
                cartItem.rows[0].id,
            ]);
        }

        // get the total products in the cart
        const totalCartItems = await dbQuery(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        const data = {
            cart_id,
            product_id,
            quantity,
            totalItems: totalCartItems.rows.length,
        };

        sendSuccessResponse(res, {
            statusCode: 201,
            data,
            message: "Item added to cart successfully",
        });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error adding item to cart",
            error: error.message,
        });
    }
};

// remove items from cart
export const removeCartItem = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { product_id } = req.body;

        if (!user_id || !product_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // Check if the cart exists for the user
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Cart not found",
            });
        }

        const cart_id = cart.rows[0].id;

        // Check if the product is in the cart
        const cartItem = await dbQuery(
            "SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2",
            [cart_id, product_id]
        );

        if (cartItem.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Product not found in cart",
            });
        }

        await dbQuery("DELETE FROM cart_items WHERE id = $1", [
            cartItem.rows[0].id,
        ]);

        // get the total products in the cart
        const totalCartItems = await dbQuery(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        sendSuccessResponse(res, {
            statusCode: 200,
            data: {
                totalItems: totalCartItems.rows.length,
                product_id,
            },
            message: "Item removed from cart successfully",
        });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error removing item from cart",
            error: error.message,
        });
    }
};

// delete the complete cart
export const deleteCart = async (req, res) => {
    try {
        const user_id = req.user.id;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // Check if the cart exists for the user
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Cart not found",
            });
        }

        const cart_id = cart.rows[0].id;

        await dbQuery("DELETE FROM cart_items WHERE cart_id = $1", [cart_id]);
        await dbQuery("DELETE FROM carts WHERE id = $1", [cart_id]);

        sendSuccessResponse(res, {
            statusCode: 200,
            message: "Cart deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting cart:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting cart",
            error: error.message,
        });
    }
};

// get cart items for the user with detailed product details
export const getCartItemsOLD = async (req, res) => {
    try {
        const user_id = req.user.id;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // Check if the cart exists for the user
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Cart not found",
            });
        }

        const cart_id = cart.rows[0].id;

        const cartItems = await dbQuery(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        if (cartItems.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No items found in cart",
            });
        }

        const items_in_carts = cartItems.rows;
        const product_ids = items_in_carts.map((product) => product.product_id);

        console.log(product_ids);

        // post request to get the product details for user from products microservice
        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        //

        if (pd.data.success && product_ids.length == pd.data.data.length) {
            const product_details = pd.data.data;

            // do operations as per grouping of same vendor_id that is all products of same vendor is one group
            const vendor_ids = product_details.map(
                (product) => product.vendor_id
            );
            const unique_vendor_ids = [...new Set(vendor_ids)];
            const grouped_products = unique_vendor_ids.map((vendor_id) => {
                return product_details.filter(
                    (product) => product.vendor_id === vendor_id
                );
            });

            let total_paying_amount = 0;
            const product_details_for_user_group_wise = [];

            // now we have grouped products of same vendor in grouped_products array
            // now we have to calculate the total price of all products of same vendor

            const price = grouped_products.map((group) => {
                let total_original_amount = 0;
                let total_discounted_amount = 0;
                // TODO UPDATE DELIVERY FEE
                let delivery_fee = 150;

                let total_amount_vendor = 0;
                const each_group_data = [];
                group.forEach((product) => {
                    const item = items_in_carts.find(
                        (item) => item.product_id === product.product_id
                    );
                    console.log(item);

                    let product_available = false;
                    if (product.available_stock >= item.quantity) {
                        total_original_amount +=
                            product.old_price * item.quantity;
                        total_discounted_amount +=
                            product.current_price * item.quantity;

                        product_available = true;
                    }

                    each_group_data.push({
                        ...product,
                        ...item,
                        product_available,
                    });
                });
                total_amount_vendor = total_discounted_amount + delivery_fee;
                total_paying_amount += total_amount_vendor;

                product_details_for_user_group_wise.push({
                    products: each_group_data,
                    price: {
                        total_original_amount,
                        total_discount:
                            total_original_amount - total_discounted_amount,
                        total_discounted_amount,
                        delivery_fee,
                        total_amount_vendor,
                    },
                });
            });

            // let total_original_amount = 0;
            // let total_discounted_amount = 0;
            // const mergedProductsDetails = items_in_carts.map((product) => {
            //     const details = product_details.find(
            //         (detail) => detail.product_id === product.product_id
            //     );
            //     total_original_amount += details.old_price * product.quantity;
            //     total_discounted_amount +=
            //         details.current_price * product.quantity;
            //     return {
            //         ...product,
            //         ...details,
            //     };
            // });

            // const price = {
            //     total_original_amount,
            //     total_discounted_amount,
            // };
            sendSuccessResponse(res, {
                statusCode: 200,
                data: {
                    products_vendor_wise: product_details_for_user_group_wise,
                    total_paying_amount,
                },
                message: "Cart items retrieved successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 500,
                message: "Error getting cart items details",
            });
        }
    } catch (error) {
        console.error("Error getting cart items:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting cart items",
            error: error.message,
        });
    }
};

export const getCartItemsShortDescription = async (req, res) => {
    try {
        const user_id = req.user.id;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // Check if the cart exists for the user
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length === 0) {
            return sendSuccessResponse(res, {
                statusCode: 200,
                data: { items: [], totalItems: 0 },
                message: "No items in the cart. ",
            });
        }

        const cart_id = cart.rows[0].id;

        const cartItems = await dbQuery(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        const data = {
            items: cartItems.rows,
            totalItems: cartItems.rows.length,
        };

        sendSuccessResponse(res, {
            statusCode: 200,
            data,
            message: "Cart items retrieved successfully",
        });
    } catch (error) {
        console.error("Error getting cart items:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting cart items",
            error: error.message,
        });
    }
};

// get cart items for the user with detailed product details
export const getCartItems = async (req, res) => {
    try {
        const user_id = req.user.id;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        const response = await getCartItemsByUserID_utils(user_id);

        if (response.success) {
            sendSuccessResponse(res, response);
        } else {
            sendErrorResponse(res, response);
        }
    } catch (error) {
        console.error("Error getting cart items:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting cart items",
            error: error.message,
        });
    }
};

export const getCartItemsByUserID_utils = async (
    user_id,
    delivery = false,
    type = "cart"
) => {
    try {
        if (!user_id) {
            return {
                success: false,
                statusCode: 400,
                message: "All required parameters are required",
                error: null,
            };
        }

        // Check if the cart exists for the user
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length === 0) {
            if (type == "order") {
                return {
                    statusCode: 500,
                    success: false,
                    error: null,
                    message: "No items found in Cart.",
                };
            }
            return {
                statusCode: 200,
                success: true,
                data: {
                    products_vendor_wise: [{ products: [] }],
                    cart_empty: true,
                    // total_bill_amount: 0,
                    // total_shipping_fee: 0,
                    // shipping_count: 0,
                    // total_paying_amount: 0,
                },
                message: "No items found in Cart.",
            };
        }

        const cart_id = cart.rows[0].id;

        const cartItems = await dbQuery(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        if (cartItems.rows.length === 0) {
            if (type == "order") {
                return {
                    statusCode: 500,
                    success: false,
                    error: null,
                    message: "No items found in Cart.",
                };
            }
            return {
                statusCode: 200,
                success: true,
                data: {
                    products_vendor_wise: [{ products: [] }],
                    cart_empty: true,
                    // total_bill_amount: 0,
                    // total_shipping_fee: 0,
                    // shipping_count: 0,
                    // total_paying_amount: 0,
                },
                message: "No items found in cart",
            };
        }

        const items_in_carts = cartItems.rows;
        const product_ids = items_in_carts.map((product) => product.product_id);

        console.log(product_ids);

        // post request to get the product details for user from products microservice
        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        //

        if (pd.data.success && product_ids.length == pd.data.data.length) {
            const product_details = pd.data.data;

            // do operations as per grouping of same vendor_id that is all products of same vendor is one group
            const vendor_ids = product_details.map(
                (product) => product.vendor_id
            );
            const unique_vendor_ids = [...new Set(vendor_ids)];
            const grouped_products = unique_vendor_ids.map((vendor_id) => {
                return product_details.filter(
                    (product) => product.vendor_id === vendor_id
                );
            });

            let total_paying_amount = 0;
            let total_bill_amount = 0;
            let total_shipping_fee = 0;
            let shipping_count = 0;

            let ordered_products = [];
            let allProductAvailable = true;

            const product_details_for_user_group_wise = [];

            // now we have grouped products of same vendor in grouped_products array
            // now we have to calculate the total price of all products of same vendor

            const price = grouped_products.map((group) => {
                let total_original_amount = 0;
                let total_discounted_amount = 0;

                // TODO UPDATE DELIVERY FEE

                let delivery_fee = 0;
                if (delivery) {
                    delivery_fee = get_shipping_fee();
                }

                let vendorID = null;

                let total_amount_vendor = 0;
                const each_group_data = [];
                group.forEach((product) => {
                    const item = items_in_carts.find(
                        (item) => item.product_id === product.product_id
                    );
                    console.log(item);

                    let product_available = false;
                    if (product.available_stock >= item.quantity) {
                        total_original_amount +=
                            product.old_price * item.quantity;
                        total_discounted_amount +=
                            product.current_price * item.quantity;

                        product_available = true;

                        vendorID = product.vendor_id;

                        if (type == "order") {
                            ordered_products.push({
                                product_id: product.product_id,
                                quantity: item.quantity,
                            });
                        }
                    } else {
                        allProductAvailable = false;
                        if (type == "order") {
                            return {
                                statusCode: 500,
                                success: false,
                                error: null,
                                message: "All Products are not available.",
                            };
                        }
                    }

                    each_group_data.push({
                        ...product,
                        ...item,
                        product_available,
                    });
                });
                total_amount_vendor = total_discounted_amount + delivery_fee;
                total_bill_amount += total_discounted_amount;
                total_shipping_fee += delivery_fee;
                shipping_count += 1;

                product_details_for_user_group_wise.push({
                    products: each_group_data,
                    price: {
                        total_original_amount,
                        total_discount:
                            total_original_amount - total_discounted_amount,
                        total_discounted_amount,
                        delivery_fee,
                        total_amount_vendor,
                        vendorID,
                    },
                });
            });

            total_paying_amount = total_bill_amount + total_shipping_fee;

            if (type == "order") {
                return {
                    statusCode: 200,
                    success: true,
                    data: {
                        products_vendor_wise:
                            product_details_for_user_group_wise,
                        total_bill_amount,
                        total_shipping_fee,
                        shipping_count,
                        total_paying_amount,
                        ordered_products,
                        allProductAvailable,
                    },
                    message: "Cart items retrieved successfully",
                };
            }
            return {
                statusCode: 200,
                success: true,
                data: {
                    products_vendor_wise: product_details_for_user_group_wise,
                    total_bill_amount,
                    total_shipping_fee,
                    shipping_count,
                    total_paying_amount,
                    pricing: {
                        total_bill_amount,
                        total_shipping_fee,
                        shipping_count,
                        total_paying_amount,
                    },
                    cart_empty: false,
                },
                message: "Cart items retrieved successfully",
            };
        } else {
            return {
                statusCode: 500,
                success: false,
                message: "Error getting cart items details",
                error: null,
            };
        }
    } catch (error) {
        console.error("Error getting cart items:", error);
        return {
            statusCode: 500,
            success: false,
            message: "Error getting cart items",
            error: error.message,
        };
    }
};
