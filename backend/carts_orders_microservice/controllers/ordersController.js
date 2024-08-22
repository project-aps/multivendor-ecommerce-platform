import { dbQuery } from "../db/db.js";
import { validateAllInputs } from "../utils/validator.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

import axios from "axios";
import dotenv from "dotenv";
import { getCartItemsByUserID_utils } from "./cartsController.js";
import { verify_payment } from "../utils/orders_utils.js";
import {
    addVendorEarnings,
    createProductReview,
    getUserAddress,
    getUserVerificationDetails,
    getVendorVerificationDetails,
    reduceProductsStocks,
} from "../services/orderService.js";
dotenv.config();

// proceed to checkout
export const checkoutToOrderPrevious = async (req, res) => {
    try {
        // get cart items
        // check and verify the product and user
        // create an order
        // create order items
        // delete cart items
        // delete cart
        // reduce the stock from products table
        // send success response

        const user_id = req.user.id;
        const { coupon_code } = req.body;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // get cart_id from the user
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Cart not found.",
            });
        }

        const cart_id = cart.rows[0].id;

        // get cartItems from the cart
        const cartItems = await dbQuery(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        if (cartItems.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "CartItems not found",
            });
        }

        const items_in_carts = cartItems.rows;

        // post request to get the product details for user from products microservice
        const product_ids = items_in_carts.map((product) => product.product_id);

        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        if (pd.data.success) {
            await dbQuery("BEGIN");

            const product_details = pd.data.data;

            let unavailable = false;
            let unavailable_products = [];
            // calculate the ordered_amount
            // calculate the discount_amount

            let ordered_amount = 0;
            let discounted_amount = 0;

            // change this shipping fee later as per address requirements
            let shipping_fee = 100;

            const mergedProductsDetails = items_in_carts.map((product) => {
                const details = product_details.find(
                    (detail) => detail.product_id === product.product_id
                );
                if (product.quantity > details.available_stock) {
                    unavailable = true;
                    unavailable_products.push({
                        ...product,
                        ...details,
                    });
                } else {
                    ordered_amount += product.quantity * details.old_price;
                    discounted_amount +=
                        product.quantity * details.current_price;
                    return {
                        ...product,
                        ...details,
                    };
                }
            });

            if (unavailable) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 400,
                    message: "Some products are not available.",
                });
            }

            let coupon_discount_amount = 0;
            let coupon_id = null;
            if (coupon_code) {
                const coupon = await validateCouponByCode(coupon_code);

                if (coupon) {
                    const coupon_type = coupon.discount_type;
                    if (coupon_type === "percent") {
                        coupon_discount_amount =
                            (coupon.discount_value / 100) * ordered_amount;
                        coupon_id = coupon.id;

                        // increase the coupon used value
                        // if error present
                        await dbQuery(
                            "UPDATE coupons SET used_count = used_count + 1 WHERE id = $1",
                            [coupon_id]
                        );
                    } else if (coupon_type === "amount") {
                        coupon_discount_amount = coupon.discount_value;
                        coupon_id = coupon.id;
                        // increase the coupon used value
                        await dbQuery(
                            "UPDATE coupons SET used_count = used_count + 1 WHERE id = $1",
                            [coupon_id]
                        );
                    } else {
                        await dbQuery("ROLLBACK");
                        return sendErrorResponse(res, {
                            statusCode: 404,
                            message: "Coupon not found/expired.",
                        });
                    }
                } else {
                    await dbQuery("ROLLBACK");
                    return sendErrorResponse(res, {
                        statusCode: 404,
                        message: "Coupon not found/expired.",
                    });
                }
            }

            let discount_amount = ordered_amount - discounted_amount;
            let total_amount =
                ordered_amount -
                discount_amount +
                shipping_fee -
                coupon_discount_amount;

            if (total_amount <= 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Coupon discount is exceeded.",
                });
            }

            // coupon id verify
            // coupon discount amount
            // calculate the shipping fee
            // calculate the ordered_amount
            // calculate the discount_amount
            // calculate total_amount

            // create an order
            let orderQuery =
                "INSERT INTO orders (user_id, ordered_amount, shipping_fee, discount_amount, coupon_discount_amount, total_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
            let orderValues = [
                user_id,
                ordered_amount,
                shipping_fee,
                discount_amount,
                coupon_discount_amount,
                total_amount,
            ];
            if (coupon_id) {
                orderQuery =
                    "INSERT INTO orders (user_id, ordered_amount, shipping_fee, discount_amount, coupon_discount_amount, total_amount, coupon_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
                orderValues.push(coupon_id);
            }
            const order = await dbQuery(orderQuery, orderValues);

            if (order.rows.length === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Error in creating Order.",
                });
            }

            const order_id = order.rows[0].id;

            // await dbQuery("BEGIN");

            // add all orderitems in bulk in a single database entry
            let orderItemsQuery = `
            INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price)
            VALUES
        `;
            const orderItemsValues = [];
            mergedProductsDetails.forEach((item, index) => {
                const offset = index * 5;
                orderItemsQuery += `($${offset + 1}, $${offset + 2}, $${
                    offset + 3
                }, $${offset + 4}, $${offset + 5}),`;
                orderItemsValues.push(
                    order_id,
                    item.product_id,
                    item.vendor_id,
                    item.quantity,
                    item.current_price
                );
            });
            orderItemsQuery = orderItemsQuery.slice(0, -1) + " RETURNING *"; // Remove the trailing comma and add RETURNING

            console.log(orderItemsQuery);
            console.log(orderItemsValues);
            const orderItems_data = await dbQuery(
                orderItemsQuery,
                orderItemsValues
            );

            if (orderItems_data.rows.length === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Error in creating Order.",
                });
            } else if (
                orderItems_data.rows.length != mergedProductsDetails.length
            ) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Error in creating Order.",
                });
            }
            const products = orderItems_data.rows;
            const price = {
                ordered_amount,
                shipping_fee,
                discount_amount,
                coupon_discount_amount,
                total_amount,
            };

            // delete cart items
            await dbQuery("DELETE FROM cart_items WHERE cart_id = $1", [
                cart_id,
            ]);

            // delete cart
            await dbQuery("DELETE FROM carts WHERE id = $1", [cart_id]);

            // reduce the stock from products table
            // const reduceStock = mergedProductsDetails.map((product) => {
            //     return dbQuery(
            //         "UPDATE products SET stock = stock - $1 WHERE id = $2",
            //         [product.quantity, product.product_id]
            //     );
            // });
            // await Promise.all(reduceStock);

            await dbQuery("COMMIT");

            sendSuccessResponse(res, {
                statusCode: 201,
                data: { products, price },
                message: "Order placed successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 500,
                message: "Error getting cart items details",
            });
        }
    } catch (error) {
        await dbQuery("ROLLBACK");
        console.error("Error adding item to cart:", error);

        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error in product checkout.",
            error: error.message,
        });
    }
};

export const checkoutToOrder = async (req, res) => {
    try {
        // get cart items
        // check and verify the product and user
        // create an order
        // create order items
        // delete cart items
        // delete cart
        // reduce the stock from products table
        // send success response

        const user_id = req.user.id;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // get cart_id from the user
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Cart not found.",
            });
        }

        const cart_id = cart.rows[0].id;

        // get cartItems from the cart
        const cartItems = await dbQuery(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [cart_id]
        );

        if (cartItems.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "CartItems not found",
            });
        }

        const items_in_carts = cartItems.rows;

        // post request to get the product details for user from products microservice
        const product_ids = items_in_carts.map((product) => product.product_id);

        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        if (pd.data.success) {
            await dbQuery("BEGIN");

            const product_details = pd.data.data;

            let unavailable = false;
            let unavailable_products = [];

            // calculate the ordered_amount
            // calculate the discount_amount

            let ordered_amount = 0;
            let discounted_amount = 0;

            // change this shipping fee later as per address requirements
            let shipping_fee = 100;

            const mergedProductsDetails = items_in_carts.map((product) => {
                const details = product_details.find(
                    (detail) => detail.product_id === product.product_id
                );
                if (product.quantity > details.available_stock) {
                    unavailable = true;
                    unavailable_products.push({
                        ...product,
                        ...details,
                    });
                } else {
                    ordered_amount += product.quantity * details.old_price;
                    discounted_amount +=
                        product.quantity * details.current_price;
                    return {
                        ...product,
                        ...details,
                    };
                }
            });

            if (unavailable) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 400,
                    message: "Some products are not available.",
                });
            }

            let coupon_discount_amount = 0;
            let coupon_id = null;
            if (coupon_code) {
                const coupon = await validateCouponByCode(coupon_code);

                if (coupon) {
                    const coupon_type = coupon.discount_type;
                    if (coupon_type === "percent") {
                        coupon_discount_amount =
                            (coupon.discount_value / 100) * ordered_amount;
                        coupon_id = coupon.id;

                        // increase the coupon used value
                        // if error present
                        await dbQuery(
                            "UPDATE coupons SET used_count = used_count + 1 WHERE id = $1",
                            [coupon_id]
                        );
                    } else if (coupon_type === "amount") {
                        coupon_discount_amount = coupon.discount_value;
                        coupon_id = coupon.id;
                        // increase the coupon used value
                        await dbQuery(
                            "UPDATE coupons SET used_count = used_count + 1 WHERE id = $1",
                            [coupon_id]
                        );
                    } else {
                        await dbQuery("ROLLBACK");
                        return sendErrorResponse(res, {
                            statusCode: 404,
                            message: "Coupon not found/expired.",
                        });
                    }
                } else {
                    await dbQuery("ROLLBACK");
                    return sendErrorResponse(res, {
                        statusCode: 404,
                        message: "Coupon not found/expired.",
                    });
                }
            }

            let discount_amount = ordered_amount - discounted_amount;
            let total_amount =
                ordered_amount -
                discount_amount +
                shipping_fee -
                coupon_discount_amount;

            if (total_amount <= 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Coupon discount is exceeded.",
                });
            }

            // coupon id verify
            // coupon discount amount
            // calculate the shipping fee
            // calculate the ordered_amount
            // calculate the discount_amount
            // calculate total_amount

            // create an order
            let orderQuery =
                "INSERT INTO orders (user_id, ordered_amount, shipping_fee, discount_amount, coupon_discount_amount, total_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
            let orderValues = [
                user_id,
                ordered_amount,
                shipping_fee,
                discount_amount,
                coupon_discount_amount,
                total_amount,
            ];
            if (coupon_id) {
                orderQuery =
                    "INSERT INTO orders (user_id, ordered_amount, shipping_fee, discount_amount, coupon_discount_amount, total_amount, coupon_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
                orderValues.push(coupon_id);
            }
            const order = await dbQuery(orderQuery, orderValues);

            if (order.rows.length === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Error in creating Order.",
                });
            }

            const order_id = order.rows[0].id;

            // await dbQuery("BEGIN");

            // add all orderitems in bulk in a single database entry
            let orderItemsQuery = `
            INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price)
            VALUES
        `;
            const orderItemsValues = [];
            mergedProductsDetails.forEach((item, index) => {
                const offset = index * 5;
                orderItemsQuery += `($${offset + 1}, $${offset + 2}, $${
                    offset + 3
                }, $${offset + 4}, $${offset + 5}),`;
                orderItemsValues.push(
                    order_id,
                    item.product_id,
                    item.vendor_id,
                    item.quantity,
                    item.current_price
                );
            });
            orderItemsQuery = orderItemsQuery.slice(0, -1) + " RETURNING *"; // Remove the trailing comma and add RETURNING

            console.log(orderItemsQuery);
            console.log(orderItemsValues);
            const orderItems_data = await dbQuery(
                orderItemsQuery,
                orderItemsValues
            );

            if (orderItems_data.rows.length === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Error in creating Order.",
                });
            } else if (
                orderItems_data.rows.length != mergedProductsDetails.length
            ) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Error in creating Order.",
                });
            }
            const products = orderItems_data.rows;
            const price = {
                ordered_amount,
                shipping_fee,
                discount_amount,
                coupon_discount_amount,
                total_amount,
            };

            // delete cart items
            await dbQuery("DELETE FROM cart_items WHERE cart_id = $1", [
                cart_id,
            ]);

            // delete cart
            await dbQuery("DELETE FROM carts WHERE id = $1", [cart_id]);

            // reduce the stock from products table
            // const reduceStock = mergedProductsDetails.map((product) => {
            //     return dbQuery(
            //         "UPDATE products SET stock = stock - $1 WHERE id = $2",
            //         [product.quantity, product.product_id]
            //     );
            // });
            // await Promise.all(reduceStock);

            await dbQuery("COMMIT");

            sendSuccessResponse(res, {
                statusCode: 201,
                data: { products, price },
                message: "Order placed successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 500,
                message: "Error getting cart items details",
            });
        }
    } catch (error) {
        await dbQuery("ROLLBACK");
        console.error("Error adding item to cart:", error);

        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error in product checkout.",
            error: error.message,
        });
    }
};

////////////////////////////////////////////////////////////////////////
// for user
// generate order summary
export const checkoutOrderSummary = async (req, res) => {
    try {
        const user_id = req.user.id;

        const { address_id } = req.body;

        if (!user_id || !address_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // verify the address of the user
        const userAddress = await getUserAddress(user_id, address_id);

        if (!userAddress.data.success) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Address not found",
            });
        }

        // get cart related summary
        const cart_summary = await getCartItemsByUserID_utils(
            user_id,
            true,
            "order"
        );

        if (cart_summary.success && cart_summary.data.allProductAvailable) {
            const allOrders = [];

            const ordersPromises = cart_summary.data.products_vendor_wise.map(
                async (each_vendor_data) => {
                    // console.log({ index });
                    const each_vendor_products = each_vendor_data.products;
                    const each_vendor_price_summary = each_vendor_data.price;

                    const vendorID = each_vendor_price_summary.vendorID;
                    // create a order for this vendor

                    await dbQuery("BEGIN");

                    let orderQuery =
                        "INSERT INTO orders (user_id,address_id, vendor_id, ordered_amount, shipping_fee, discount_amount, total_amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
                    let orderValues = [
                        user_id,
                        address_id,
                        vendorID,
                        each_vendor_price_summary.total_original_amount,
                        each_vendor_price_summary.delivery_fee,
                        each_vendor_price_summary.total_discount,
                        each_vendor_price_summary.total_amount_vendor,
                    ];

                    const order = await dbQuery(orderQuery, orderValues);

                    if (order.rows.length === 0) {
                        await dbQuery("ROLLBACK");
                        return sendErrorResponse(res, {
                            statusCode: 404,
                            message: "Error in creating Order.",
                        });
                    }

                    const order_id = order.rows[0].id;

                    // await dbQuery("BEGIN");

                    // add all orderitems in bulk in a single database entry
                    let orderItemsQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES`;
                    const orderItemsValues = [];
                    each_vendor_products.forEach((item, index) => {
                        const offset = index * 4;
                        orderItemsQuery += `($${offset + 1}, $${offset + 2}, $${
                            offset + 3
                        }, $${offset + 4}),`;
                        orderItemsValues.push(
                            order_id,
                            item.product_id,
                            item.quantity,
                            item.current_price
                        );
                    });
                    orderItemsQuery =
                        orderItemsQuery.slice(0, -1) + " RETURNING *"; // Remove the trailing comma and add RETURNING

                    console.log(orderItemsQuery);
                    console.log(orderItemsValues);
                    const orderItems_data = await dbQuery(
                        orderItemsQuery,
                        orderItemsValues
                    );

                    if (orderItems_data.rows.length === 0) {
                        await dbQuery("ROLLBACK");
                        return sendErrorResponse(res, {
                            statusCode: 404,
                            message: "Error in creating Order.",
                        });
                    } else if (
                        orderItems_data.rows.length !=
                        each_vendor_products.length
                    ) {
                        await dbQuery("ROLLBACK");
                        return sendErrorResponse(res, {
                            statusCode: 404,
                            message: "Error in creating Order.",
                        });
                    }

                    allOrders.push({
                        order: order.rows,
                        products: each_vendor_products,
                        price: each_vendor_price_summary,
                    });

                    await dbQuery("COMMIT");

                    return true;
                }
            );

            await Promise.all(ordersPromises);

            if (
                allOrders.length !=
                cart_summary.data.products_vendor_wise.length
            ) {
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Error in creating Order.",
                });
            }

            sendSuccessResponse(res, {
                statusCode: 201,
                data: {
                    orders: allOrders,
                    price: {
                        total_bill_amount: cart_summary.data.total_bill_amount,
                        total_shipping_fee:
                            cart_summary.data.total_shipping_fee,
                        shipping_count: cart_summary.data.shipping_count,
                        total_paying_amount:
                            cart_summary.data.total_paying_amount,
                    },
                },
                message: "Order placed successfully",
            });
        } else {
            return sendErrorResponse(res, cart_summary);
        }
    } catch (error) {
        console.error("Error adding item to cart:", error);

        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error in product checkout.",
            error: error.message,
        });
    }
};

// mark the order confirmed by the user
export const markOrderAsConfirmed = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const user_id = req.user.id;

        const { payment_method, payment_gateway, txn_id, amount } = req.body;

        // get the payment info of the order

        if (!order_id || !user_id || !payment_method || !amount) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // if gateway is present then txn_id should also be present
        if (payment_gateway && !txn_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Gateway and Transaction ID is required.",
            });
        }

        const order = await dbQuery(
            "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
            [order_id, user_id]
        );

        if (order.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Order not found",
            });
        }

        // check if the order not pending then send error
        if (order.rows[0].order_status != "pending") {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Order is already confirmed",
            });
        }

        const orderItems = await dbQuery(
            "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
            [order_id]
        );

        if (orderItems.rows.length === 0) {
            await dbQuery("ROLLBACK");
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No items found in order",
            });
        }

        // get the total amount from the order
        const order_amount = order.rows[0].total_amount;

        if (order_amount != amount) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Amount mismatch",
            });
        }
        // verify the payment

        if (!verify_payment(payment_method, payment_gateway, txn_id, amount)) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Payment verification failed",
            });
        }

        await dbQuery("BEGIN");
        // add payment data in table of this order
        let paymentQuery =
            "INSERT INTO payments (order_id, payment_method, payment_gateway, transaction_id, amount) VALUES ($1, $2, $3, $4, $5) RETURNING *";
        let paymentValues = [
            order_id,
            payment_method,
            payment_gateway,
            txn_id,
            amount,
        ];

        const payment = await dbQuery(paymentQuery, paymentValues);

        if (payment.rows.length === 0) {
            await dbQuery("ROLLBACK");
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Error in adding payment.",
            });
        }

        // mark the order as confirmed
        await dbQuery(
            "UPDATE orders SET order_status = 'confirmed' WHERE id = $1",
            [order_id]
        );

        // delete the cart and cartItems
        const cart = await dbQuery("SELECT id FROM carts WHERE user_id = $1", [
            user_id,
        ]);

        if (cart.rows.length !== 0) {
            const cart_id = cart.rows[0].id;

            await dbQuery("DELETE FROM cart_items WHERE cart_id = $1", [
                cart_id,
            ]);

            await dbQuery("DELETE FROM carts WHERE id = $1", [cart_id]);
        }

        // update the stock of the products
        const orderItemsData = orderItems.rows;
        console.log(orderItemsData);

        // get the id and quqntity of all ordered products
        const products_data = orderItemsData.map((product) => {
            return { id: product.product_id, quantity: product.quantity };
        });

        const product_stock_update = await reduceProductsStocks(products_data);

        console.log(product_stock_update);

        if (!product_stock_update) {
            await dbQuery("ROLLBACK");
            return sendErrorResponse(res, {
                statusCode: 500,
                message: "Error updating stock",
            });
        }

        if (!product_stock_update.data.success) {
            await dbQuery("ROLLBACK");
            return sendErrorResponse(res, {
                statusCode: 500,
                message: product_stock_update.data.message,
            });
        }

        // use message broker to pass the orderItemsData
        // to the products microservice to update the stock

        await dbQuery("COMMIT");

        sendSuccessResponse(res, {
            statusCode: 200,
            message: "Order is confirmed.",
        });
    } catch (error) {
        console.error("Error marking order as confirmed:", error);
        await dbQuery("ROLLBACK");
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error marking order as confirmed",
            error: error.message,
        });
    }
};
////////////////////////////////////////////////////////////////////////
// for vendors
// get orders of its own vendor
export const getAllOwnOrdersOfVendor = async (req, res) => {
    try {
        const vendor_id = req.user.id;
        const { order_status } = req.query;

        if (!vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        let orders = null;

        if (order_status) {
            orders = await dbQuery(
                "SELECT * FROM orders WHERE vendor_id = $1 AND order_status = $2 ORDER BY created_at DESC",
                [vendor_id, order_status]
            );
        } else {
            orders = await dbQuery(
                "SELECT * FROM orders WHERE vendor_id = $1 AND order_status != 'pending' ORDER BY created_at DESC",
                [vendor_id]
            );
        }

        if (orders.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No orders found",
            });
        }

        const data = orders.rows;
        sendSuccessResponse(res, {
            statusCode: 200,
            data: data,
            message: "Orders retrieved successfully",
        });
    } catch (error) {
        console.error("Error getting orders:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting orders",
            error: error.message,
        });
    }
};

// get the order details using orderID
export const getOrderDetailsOfVendorByOrderID = async (req, res) => {
    try {
        const order_id = req.params.id;
        const vendor_id = req.user.id;

        if (!order_id || !vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        const order = await dbQuery(
            "SELECT * FROM orders WHERE id = $1 AND vendor_id = $2",
            [order_id, vendor_id]
        );

        if (order.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Order not found",
            });
        }

        const orderItems = await dbQuery(
            "SELECT * FROM order_items WHERE order_id = $1",
            [order_id]
        );

        if (orderItems.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No items found in order",
            });
        }
        const items_in_orders = orderItems.rows;
        const product_ids = items_in_orders.map(
            (product) => product.product_id
        );

        // console.log(product_ids);

        // post request to get the product details for user from products microservice
        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        //

        if (pd.data.success && product_ids.length == pd.data.data.length) {
            const product_details = pd.data.data;

            const mergedProductsDetails = items_in_orders.map((product) => {
                const details = product_details.find(
                    (detail) => detail.product_id === product.product_id
                );
                return {
                    ...product,
                    ...details,
                };
            });

            // fetch the address details of the user from address_id
            const address_id = order.rows[0].address_id;
            const user_id = order.rows[0].user_id;
            const userAddress = await getUserAddress(user_id, address_id);
            let address_data = null;
            if (userAddress.data.success) {
                address_data = userAddress.data.data;
            }

            // fetch the user details

            const userData = await getUserVerificationDetails(user_id);
            let user_data = null;
            if (userData.data.success) {
                user_data = userData.data.data;
            }

            // fetch payment details
            const payment = await dbQuery(
                "SELECT * FROM payments WHERE order_id = $1",
                [order_id]
            );

            if (payment.rows.length === 0) {
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Payment not found",
                });
            }

            sendSuccessResponse(res, {
                statusCode: 200,
                data: {
                    order: order.rows[0],
                    products: mergedProductsDetails,
                    address: address_data,
                    user: user_data,
                    payment: payment.rows[0],
                },
                message: "Order details retrieved successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 500,
                message: "Error getting product details",
            });
        }
    } catch (error) {
        console.error("Error getting order details:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting order details",
            error: error.message,
        });
    }
};

// make the order status delivered
export const changeOrderStatusByVendor = async (req, res) => {
    try {
        const order_id = req.params.id;
        const vendor_id = req.user.id;

        const { order_status } = req.body;

        if (!order_id || !vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        if (
            order_status == "approved" ||
            order_status == "delivery_processing" ||
            order_status == "delivered"
        ) {
            const order = await dbQuery(
                "SELECT * FROM orders WHERE id = $1 AND vendor_id = $2",
                [order_id, vendor_id]
            );

            if (order.rows.length === 0) {
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Order not found",
                });
            }
            const order_data = order.rows[0];

            if (order_data.order_status == "delivered") {
                return sendErrorResponse(res, {
                    statusCode: 400,
                    message: "Order is already delivered",
                });
            }

            if (
                order_data.order_status == "approved" &&
                order_status == "confirmed"
            ) {
                return sendErrorResponse(res, {
                    statusCode: 400,
                    message: "Order is already confirmed",
                });
            }

            if (
                order_data.order_status == "delivery_processing" &&
                order_status == "confirmed"
            ) {
                return sendErrorResponse(res, {
                    statusCode: 400,
                    message: "Order is already confirmed",
                });
            }

            await dbQuery("UPDATE orders SET order_status = $1 WHERE id = $2", [
                order_status,
                order_id,
            ]);

            // if order is delivered then also add in payments
            if (order_status == "delivered") {
                // get the payment from order id
                // change the payment status to approved

                const payment = await dbQuery(
                    "SELECT * FROM payments WHERE order_id = $1",
                    [order_id]
                );

                if (payment.rows.length === 0) {
                    return sendErrorResponse(res, {
                        statusCode: 404,
                        message: "Payment not found",
                    });
                }

                await dbQuery(
                    "UPDATE payments SET payment_status = 'approved', updated_at = NOW() WHERE order_id = $1",
                    [order_id]
                );

                // also update the deliverd_at of order to current time
                await dbQuery(
                    "UPDATE orders SET delivered_at = NOW() WHERE id = $1",
                    [order_id]
                );

                // add the vendor earnings
                const orders_data = order.rows[0];
                console.log(orders_data);
                const order_amount =
                    orders_data.total_amount - orders_data.shipping_fee;
                const vendor_earnings_result = await addVendorEarnings(
                    vendor_id,
                    order_id,
                    order_amount
                );

                if (!vendor_earnings_result.data.success) {
                    return sendErrorResponse(res, {
                        statusCode: 500,
                        message: "Error adding vendor earnings",
                    });
                }
            }

            sendSuccessResponse(res, {
                statusCode: 200,
                message: "Order status updated successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Invalid order status",
            });
        }
    } catch (error) {
        console.error("Error marking order as delivered:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error marking order as delivered",
            error: error.message,
        });
    }
};

// get the vendor's dashboard data
export const getVendorsDashboardData = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        const totalSalesQuery = `
            SELECT SUM(total_amount) AS total_sales
            FROM orders
            WHERE vendor_id = $1 AND order_status = 'delivered'
        `;
        const totalOrdersQuery = `
            SELECT COUNT(*) AS total_orders
            FROM orders
            WHERE vendor_id = $1
        `;
        const totalDeliveredOrdersQuery = `
            SELECT COUNT(*) AS total_delivered_orders
            FROM orders
            WHERE vendor_id = $1 AND order_status = 'delivered'
        `;
        const totalPendingOrdersQuery = `
            SELECT COUNT(*) AS total_pending_orders
            FROM orders
            WHERE vendor_id = $1 AND order_status = 'pending'
        `;
        const totalProcessingOrdersQuery = `
            SELECT COUNT(*) AS total_processing_orders
            FROM orders
            WHERE vendor_id = $1 AND order_status = 'processing'
        `;
        const totalApprovedOrdersQuery = `
            SELECT COUNT(*) AS total_approved_orders
            FROM orders
            WHERE vendor_id = $1 AND order_status = 'approved'
        `;
        const totalUsersOrderedQuery = `
            SELECT COUNT(DISTINCT user_id) AS total_users_ordered
            FROM orders
            WHERE vendor_id = $1
        `;
        const totalProductsSoldQuery = `
            SELECT COUNT(DISTINCT product_id) AS total_products_sold
            FROM order_items
            INNER JOIN orders ON orders.id = order_items.order_id
            WHERE orders.vendor_id = $1 AND orders.order_status = 'delivered'
        `;
        const totalItemsSoldQuery = `
            SELECT SUM(quantity) AS total_items_sold
            FROM order_items
            INNER JOIN orders ON orders.id = order_items.order_id
            WHERE orders.vendor_id = $1 AND orders.order_status = 'delivered'
        `;

        const results = await Promise.all([
            dbQuery(totalSalesQuery, [vendor_id]),
            dbQuery(totalOrdersQuery, [vendor_id]),
            dbQuery(totalDeliveredOrdersQuery, [vendor_id]),
            dbQuery(totalPendingOrdersQuery, [vendor_id]),
            dbQuery(totalProcessingOrdersQuery, [vendor_id]),
            dbQuery(totalUsersOrderedQuery, [vendor_id]),
            dbQuery(totalProductsSoldQuery, [vendor_id]),
            dbQuery(totalItemsSoldQuery, [vendor_id]),
            dbQuery(totalApprovedOrdersQuery, [vendor_id]),
        ]);

        const responseData = {
            total_sales: results[0].rows[0].total_sales || 0,
            total_orders: results[1].rows[0].total_orders || 0,
            total_delivered_orders:
                results[2].rows[0].total_delivered_orders || 0,
            total_pending_orders: results[3].rows[0].total_pending_orders || 0,
            total_processing_orders:
                results[4].rows[0].total_processing_orders || 0,
            total_users_ordered: results[5].rows[0].total_users_ordered || 0,
            total_products_sold: results[6].rows[0].total_products_sold || 0,
            total_items_sold: results[7].rows[0].total_items_sold || 0,
            total_approved_orders:
                results[3].rows[0].total_approved_orders || 0,
        };

        sendSuccessResponse(res, {
            statusCode: 200,
            data: responseData,
            message: "Dashboard Data retrieved successfully",
        });
    } catch (error) {
        console.error("Error getting order details:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting dashboard details.",
            error: error.message,
        });
    }
};

export const getDailyOrdersForVendor = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        if (!vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Vendor ID is required",
            });
        }

        const query = `
            SELECT 
                (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date AS date,
                COUNT(*) AS total_orders
            FROM orders
            WHERE vendor_id = $1
            GROUP BY (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date
            ORDER BY (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date ASC;
        `;

        const result = await dbQuery(query, [vendor_id]);
        const dailyOrders = result.rows;

        sendSuccessResponse(res, {
            data: {
                dailyOrders,
            },
            message: "Daily orders for vendor retrieved successfully",
        });
    } catch (error) {
        console.error("Error retrieving daily orders for vendor:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving daily orders for vendor",
            error: error.message,
        });
    }
};

////////////////////////////////////////////////////////////////////////
// for users
// get all orders of the user
export const getAllOwnOrdersOfUser = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { order_status } = req.query;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        let orders = null;

        if (order_status == "delivered") {
            orders = await dbQuery(
                "SELECT * FROM orders WHERE user_id = $1 AND order_status = $2 ORDER BY created_at DESC",
                [user_id, order_status]
            );
        } else if (order_status == "not_delivered") {
            orders = await dbQuery(
                "SELECT * FROM orders WHERE user_id = $1 AND (order_status != 'delivered' AND order_status !='pending') ORDER BY created_at DESC",
                [user_id]
            );
        } else {
            orders = await dbQuery(
                "SELECT * FROM orders WHERE user_id = $1 AND order_status != 'pending' ORDER BY created_at DESC",
                [user_id]
            );
        }

        if (orders.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No orders found",
            });
        }

        const data = orders.rows;
        sendSuccessResponse(res, {
            statusCode: 200,
            data: data,
            message: "Orders retrieved successfully",
        });
    } catch (error) {
        console.error("Error getting orders:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting orders",
            error: error.message,
        });
    }
};

// get the order details using orderID
export const getOrderDetailsOfUserByOrderID = async (req, res) => {
    try {
        const order_id = req.params.id;
        const user_id = req.user.id;

        if (!order_id || !user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        const order = await dbQuery(
            "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
            [order_id, user_id]
        );

        if (order.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Order not found",
            });
        }

        const orderItems = await dbQuery(
            "SELECT * FROM order_items WHERE order_id = $1",
            [order_id]
        );

        if (orderItems.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No items found in order",
            });
        }
        const items_in_orders = orderItems.rows;
        const product_ids = items_in_orders.map(
            (product) => product.product_id
        );

        // console.log(product_ids);

        // post request to get the product details for user from products microservice
        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        //

        if (pd.data.success && product_ids.length == pd.data.data.length) {
            const product_details = pd.data.data;

            const mergedProductsDetails = items_in_orders.map((product) => {
                const details = product_details.find(
                    (detail) => detail.product_id === product.product_id
                );
                return {
                    ...product,
                    ...details,
                };
            });

            // fetch the address details of the user from address_id
            const address_id = order.rows[0].address_id;
            const userAddress = await getUserAddress(user_id, address_id);
            let address_data = null;
            if (userAddress.data.success) {
                address_data = userAddress.data.data;
            }

            // fetch the user details

            const userData = await getUserVerificationDetails(user_id);
            let user_data = null;
            if (userData.data.success) {
                user_data = userData.data.data;
            }
            // fetch payment details
            const payment = await dbQuery(
                "SELECT * FROM payments WHERE order_id = $1",
                [order_id]
            );

            if (payment.rows.length === 0) {
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Payment not found",
                });
            }

            sendSuccessResponse(res, {
                statusCode: 200,
                data: {
                    order: order.rows[0],
                    products: mergedProductsDetails,
                    address: address_data,
                    user: user_data,
                    payment: payment.rows[0],
                },
                message: "Order details retrieved successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 500,
                message: "Error getting product details",
            });
        }
    } catch (error) {
        console.error("Error getting order details:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting order details",
            error: error.message,
        });
    }
};

// get all the pending reviews of the orders from the users
export const getPendingReviewsOfUser = async (req, res) => {
    try {
        const user_id = req.user.id;

        if (!user_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // const orders = await dbQuery(
        //     "SELECT id, delivered_at FROM orders WHERE user_id = $1 AND order_status = 'delivered' ORDER BY delivered_at DESC",
        //     [user_id]
        // );

        // if (orders.rows.length === 0) {
        //     return sendErrorResponse(res, {
        //         statusCode: 404,
        //         message: "No orders found",
        //     });
        // }

        // const order_ids = orders.rows.map((order) => order.id);

        // console.log(order_ids);

        // // check the order items of the order where order_items-status != reviewed then mark them as pending
        // const orderItems = await dbQuery(
        //     "SELECT product_id, order_id FROM order_items WHERE order_id = ANY($1) AND order_status != 'reviewed' GROUP BY order_id, product_id",
        //     [order_ids]
        // );

        // console.log(orderItems.rows);

        // if (orderItems.rows.length === 0) {
        //     return sendErrorResponse(res, {
        //         statusCode: 404,
        //         message: "No pending reviews found",
        //     });
        // }

        const query = `
        SELECT 
            oi.product_id AS product_id,
            o.id AS order_id,
            o.delivered_at AS delivered_at

        FROM 
            orders o
        JOIN 
            order_items oi ON o.id = oi.order_id
        WHERE 
            o.user_id = $1
            AND o.order_status = 'delivered'
            AND oi.order_status != 'reviewed'
        ORDER BY 
            o.delivered_at DESC
    `;

        const orders = await dbQuery(query, [user_id]);

        // const { rows } = await pool.query(query, [userId]);

        if (orders.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No pending reviews found",
            });
        }

        console.log(orders);

        const product_ids_all = orders.rows.map((row) => row.product_id);
        // only get the unique product IDs

        const product_ids = [...new Set(product_ids_all)];
        console.log(product_ids);

        // get the product details from the products microservice
        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        console.log(product_ids.length);
        console.log(pd.data.data.length);

        if (pd.data.success && product_ids.length == pd.data.data.length) {
            const product_details = pd.data.data;

            const mergedProductsDetails = orders.rows.map((product) => {
                const details = product_details.find(
                    (detail) => detail.product_id === product.product_id
                );
                // get delivered_at from order as well
                const order = orders.rows.find(
                    (order) => order.order_id === product.order_id
                );

                return {
                    ...product,
                    ...details,
                    delivered_at: order.delivered_at,
                    is_reviewed: false,
                };
            });

            // combine same order_id products in an array and again send in array form

            // const mergedProductsDetailsGrouped = mergedProductsDetails.reduce(
            //     (r, a) => {
            //         r[a.order_id] = r[a.order_id] || [];
            //         r[a.order_id].push(a);
            //         return r;
            //     },
            //     Object.create(null)
            // );

            const groupedOrders = mergedProductsDetails.reduce(
                (acc, product) => {
                    const { order_id, delivered_at } = product;

                    if (!acc[order_id]) {
                        acc[order_id] = {
                            order_id,
                            delivered_at,
                            products: [],
                        };
                    }

                    acc[order_id].products.push({
                        product_id: product.product_id,
                        product_name: product.product_name,
                        thumbnail_url: product.thumbnail_url,
                        brand_name: product.brand_name,
                        category_name: product.category_name,
                        subcategory_name: product.subcategory_name,
                        vendor_name: product.vendor_name,
                        vendor_id: product.vendor_id,
                        is_reviewed: product.is_reviewed,
                    });

                    return acc;
                },
                {}
            );
            const orders_data = Object.values(groupedOrders);
            orders_data.sort(
                (a, b) => new Date(b.delivered_at) - new Date(a.delivered_at)
            );

            // console.log(mergedProductsDetailsGrouped);

            sendSuccessResponse(res, {
                statusCode: 200,
                data: { orders: orders_data },
                message: "Pending reviews retrieved successfully",
            });
        } else {
            return sendErrorResponse(res, {
                error: pd.data.message || "Error fetching product details",
                statusCode: 500,
                message: "Error getting product details",
            });
        }
    } catch (error) {
        console.error("Error getting pending reviews:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting pending reviews",
            error: error.message,
        });
    }
};

// add review of the product
export const addReviewOfProduct = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { product_id, order_id, review, rating } = req.body;

        if (!user_id || !product_id || !order_id || !rating) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // check if that order is delivered or not
        const order = await dbQuery(
            "SELECT id FROM orders WHERE id = $1 AND user_id = $2 AND order_status = 'delivered'",
            [order_id, user_id]
        );

        if (order.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Order not found or not delivered",
            });
        }

        // check if the product is in the order
        const orderItem = await dbQuery(
            "SELECT id, order_status FROM order_items WHERE order_id = $1 AND product_id = $2",
            [order_id, product_id]
        );

        if (orderItem.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Product not found in order",
            });
        }

        const order_item_id = orderItem.rows[0].id;

        // check if the product is not reviewed
        if (orderItem.rows[0].order_status == "reviewed") {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Product is already reviewed",
            });
        }

        // add the review in the products microservice

        const product_review_add_result = await createProductReview(
            user_id,
            order_id,
            product_id,
            review,
            rating
        );

        console.log(product_review_add_result);

        if (!product_review_add_result.data.success) {
            return sendErrorResponse(res, {
                statusCode: 500,
                message: "Error adding review",
            });
        }

        // update the order_items status to reviewed
        await dbQuery(
            "UPDATE order_items SET order_status = 'reviewed' WHERE id = $1 ",
            [order_item_id]
        );

        sendSuccessResponse(res, {
            statusCode: 201,
            // data: pd.data.data,
            message: "Product review added successfully",
        });
    } catch (error) {
        console.error("Error adding review:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error adding review",
            error: error.message,
        });
    }
};

////////////////////////////////////////////////////////////////////////
// for admins
// get all orders
export const getAllOrdersAdmin = async (req, res) => {
    try {
        // const vendor_id = req.user.id;
        const { order_status } = req.query;

        let orders = null;

        if (order_status) {
            orders = await dbQuery(
                "SELECT * FROM orders WHERE order_status = $1",
                [order_status]
            );
        } else {
            orders = await dbQuery(
                "SELECT * FROM orders WHERE order_status != 'pending'"
            );
        }

        if (orders.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No orders found",
            });
        }

        const data = orders.rows;
        sendSuccessResponse(res, {
            statusCode: 200,
            data: data,
            message: "Orders retrieved successfully",
        });
    } catch (error) {
        console.error("Error getting orders:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting orders",
            error: error.message,
        });
    }
};

// get the order details using orderID
export const getOrderDetailsByOrderIDAdmin = async (req, res) => {
    try {
        const order_id = req.params.id;

        if (!order_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        const order = await dbQuery("SELECT * FROM orders WHERE id = $1", [
            order_id,
        ]);

        if (order.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Order not found",
            });
        }

        const orderItems = await dbQuery(
            "SELECT * FROM order_items WHERE order_id = $1",
            [order_id]
        );

        if (orderItems.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No items found in order",
            });
        }
        const items_in_orders = orderItems.rows;
        const product_ids = items_in_orders.map(
            (product) => product.product_id
        );

        // console.log(product_ids);

        // post request to get the product details for user from products microservice
        const url = process.env.PRODUCTS_SERVICE_API + "/products/multiple";
        const pd = await axios.post(url, {
            product_ids: product_ids,
        });

        //

        if (pd.data.success && product_ids.length == pd.data.data.length) {
            const product_details = pd.data.data;

            const mergedProductsDetails = items_in_orders.map((product) => {
                const details = product_details.find(
                    (detail) => detail.product_id === product.product_id
                );
                return {
                    ...product,
                    ...details,
                };
            });

            // fetch the address details of the user from address_id
            const address_id = order.rows[0].address_id;
            const user_id = order.rows[0].user_id;

            const userAddress = await getUserAddress(user_id, address_id);
            let address_data = null;
            if (userAddress.data.success) {
                address_data = userAddress.data.data;
            }

            // fetch the user details
            const userData = await getUserVerificationDetails(user_id);
            let user_data = null;
            if (userData.data.success) {
                user_data = userData.data.data;
            }

            // fetch the vendor details
            const vendor_id = order.rows[0].vendor_id;
            console.log({ vendor_id });
            const vendorData = await getVendorVerificationDetails(vendor_id);
            let vendor_data = null;
            if (vendorData.data.success) {
                vendor_data = vendorData.data.data;
            }

            // fetch payment details
            const payment = await dbQuery(
                "SELECT * FROM payments WHERE order_id = $1",
                [order_id]
            );

            if (payment.rows.length === 0) {
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Payment not found",
                });
            }

            sendSuccessResponse(res, {
                statusCode: 200,
                data: {
                    order: order.rows[0],
                    products: mergedProductsDetails,
                    address: address_data,
                    user: user_data,
                    vendor: vendor_data,
                    payment: payment.rows[0],
                },
                message: "Order details retrieved successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 500,
                message: "Error getting product details",
            });
        }
    } catch (error) {
        console.error("Error getting order details:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting order details",
            error: error.message,
        });
    }
};

export const getAdminDashboardData = async (req, res) => {
    try {
        // Queries to get aggregated data for all vendors
        const totalSalesQuery = `
            SELECT SUM(total_amount) AS total_sales
            FROM orders
            WHERE order_status = 'delivered'
        `;
        const totalOrdersQuery = `
            SELECT COUNT(*) AS total_orders
            FROM orders
            WHERE order_status != 'pending'
        `;
        const totalDeliveredOrdersQuery = `
            SELECT COUNT(*) AS total_delivered_orders
            FROM orders
            WHERE order_status = 'delivered'
        `;
        const totalPendingOrdersQuery = `
            SELECT COUNT(*) AS total_pending_orders
            FROM orders
            WHERE order_status = 'pending'
        `;
        const totalProcessingOrdersQuery = `
            SELECT COUNT(*) AS total_processing_orders
            FROM orders
            WHERE order_status = 'delivery_processing'
        `;
        const totalApprovedOrdersQuery = `
            SELECT COUNT(*) AS total_approved_orders
            FROM orders
            WHERE order_status = 'approved'
        `;
        const totalUsersOrderedQuery = `
            SELECT COUNT(DISTINCT user_id) AS total_users_ordered
            FROM orders
        `;
        const totalProductsSoldQuery = `
            SELECT COUNT(DISTINCT product_id) AS total_products_sold
            FROM order_items
            INNER JOIN orders ON orders.id = order_items.order_id
            WHERE orders.order_status = 'delivered'
        `;
        const totalItemsSoldQuery = `
            SELECT SUM(quantity) AS total_items_sold
            FROM order_items
            INNER JOIN orders ON orders.id = order_items.order_id
            WHERE orders.order_status = 'delivered'
        `;

        const totalDeliveryFeesQuery = `
        SELECT SUM(shipping_fee) AS total_shipping_fees
        FROM orders
        WHERE order_status = 'delivered'
        `;

        // Execute all queries concurrently
        const results = await Promise.all([
            dbQuery(totalSalesQuery),
            dbQuery(totalOrdersQuery),
            dbQuery(totalDeliveredOrdersQuery),
            dbQuery(totalPendingOrdersQuery),
            dbQuery(totalProcessingOrdersQuery),
            dbQuery(totalUsersOrderedQuery),
            dbQuery(totalProductsSoldQuery),
            dbQuery(totalItemsSoldQuery),
            dbQuery(totalApprovedOrdersQuery),
            dbQuery(totalDeliveryFeesQuery),
        ]);

        // Aggregate results
        const responseData = {
            total_sales: results[0].rows[0].total_sales || 0,
            total_orders: results[1].rows[0].total_orders || 0,
            total_delivered_orders:
                results[2].rows[0].total_delivered_orders || 0,
            total_pending_orders: results[3].rows[0].total_pending_orders || 0,
            total_processing_orders:
                results[4].rows[0].total_processing_orders || 0,
            total_users_ordered: results[5].rows[0].total_users_ordered || 0,
            total_products_sold: results[6].rows[0].total_products_sold || 0,
            total_items_sold: results[7].rows[0].total_items_sold || 0,
            total_approved_orders:
                results[8].rows[0].total_approved_orders || 0,
            total_shipping_fees: results[9].rows[0].total_shipping_fees || 0,
        };

        sendSuccessResponse(res, {
            statusCode: 200,
            data: responseData,
            message: "Aggregated Dashboard Data retrieved successfully",
        });
    } catch (error) {
        console.error("Error getting aggregated dashboard details:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting aggregated dashboard details.",
            error: error.message,
        });
    }
};

export const getDailyOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date AS date,
                COUNT(*) AS total_orders
            FROM orders
            GROUP BY (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date
            ORDER BY (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date ASC;
        `;

        const result = await dbQuery(query);
        const dailyOrders = result.rows;

        sendSuccessResponse(res, {
            data: {
                dailyOrders,
            },
            message: "Daily orders retrieved successfully",
        });
    } catch (error) {
        console.error("Error retrieving daily orders:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving daily orders",
            error: error.message,
        });
    }
};

////////////////////////////////////////////////////////////////////////

// utils
// validate coupon by user
export const validateCouponByCode = async (code) => {
    //
    if (!code) {
        return null;
    }

    try {
        // // first logic
        // const result = await dbQuery("SELECT * FROM coupons WHERE code = $1", [
        //     code,
        // ]);

        // if (result.rows.length > 0) {
        //     const coupon = result.rows[0];

        //     if (!coupon.is_active) {
        //         return sendErrorResponse(res, {
        //             statusCode: 400,
        //             message: "Coupon is not active",
        //         });
        //     }

        //     const today = new Date();
        //     const valid_from = new Date(coupon.valid_from);
        //     const valid_until = new Date(coupon.valid_until);

        //     if (today < valid_from || today > valid_until) {
        //         return sendErrorResponse(res, {
        //             statusCode: 400,
        //             message: "Coupon is not valid",
        //         });
        //     }

        //     if (coupon.used_count >= coupon.max_uses) {
        //         return sendErrorResponse(res, {
        //             statusCode: 400,
        //             message: "Coupon has reached maximum uses",
        //         });
        //     }

        //     sendSuccessResponse(res, {
        //         statusCode: 200,
        //         data: coupon,
        //         message: "Coupon is valid",
        //     });
        // } else {
        //     sendErrorResponse(res, {
        //         statusCode: 404,
        //         message: "Coupon not found",
        //     });
        // }

        // second logic
        // Query to check coupon validity
        const query = `
        SELECT * FROM coupons 
        WHERE code = $1 
        AND is_active = TRUE 
        AND valid_from <= NOW() 
        AND valid_until >= NOW()
        AND (max_uses = 0 OR used_count < max_uses)`;

        const result = await dbQuery(query, [code]);

        if (result.rows.length === 0) {
            return null;
        }

        const coupon = result.rows[0];

        // Coupon is valid
        return coupon;
    } catch (error) {
        console.error("Error validating coupon:", error);
        return null;
    }
};
