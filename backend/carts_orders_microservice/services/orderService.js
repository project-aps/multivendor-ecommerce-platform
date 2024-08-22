import { connectAMQP } from "../config/amqp.js";
import { v4 as uuidv4 } from "uuid";

const correlationMap = new Map();

export const processOrderRequests = async () => {
    const { channel } = await connectAMQP();
};

// reduce the stock
export const reduceProductsStocks = async (products) => {
    const { channel } = await connectAMQP();
    const correlationId = uuidv4();
    const responseQueue = "product_stock_response_queue";

    return new Promise((resolve, reject) => {
        // Store the resolve function in the correlationMap
        correlationMap.set(correlationId, resolve);
        channel.consume(
            responseQueue,
            (msg) => {
                const receivedCorrelationId = msg.properties.correlationId;
                if (correlationMap.has(receivedCorrelationId)) {
                    // Resolve the corresponding promise
                    const resolveFn = correlationMap.get(receivedCorrelationId);
                    resolveFn(JSON.parse(msg.content.toString()));

                    // Remove the correlationId from the map
                    correlationMap.delete(receivedCorrelationId);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

        channel.sendToQueue(
            "product_stock_request_queue",
            Buffer.from(
                JSON.stringify({
                    type: "PRODUCT_REQUEST",
                    products,
                })
            ),
            { correlationId, replyTo: responseQueue }
        );
    });
};

// get user address
export const getUserAddress = async (userId, addressId) => {
    const { channel } = await connectAMQP();
    const correlationId = uuidv4();
    const responseQueue = "user_address_response_queue";

    return new Promise((resolve, reject) => {
        // Store the resolve function in the correlationMap
        correlationMap.set(correlationId, resolve);

        channel.consume(
            responseQueue,
            (msg) => {
                const receivedCorrelationId = msg.properties.correlationId;
                if (correlationMap.has(receivedCorrelationId)) {
                    // Resolve the corresponding promise
                    const resolveFn = correlationMap.get(receivedCorrelationId);
                    resolveFn(JSON.parse(msg.content.toString()));

                    // Remove the correlationId from the map
                    correlationMap.delete(receivedCorrelationId);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

        channel.sendToQueue(
            "user_address_request_queue",
            Buffer.from(
                JSON.stringify({
                    type: "USER_REQUEST",
                    userId,
                    addressId,
                })
            ),
            { correlationId, replyTo: responseQueue }
        );
    });
};

// get user details
export const getUserVerificationDetails = async (userId) => {
    const { channel } = await connectAMQP();
    const correlationId = uuidv4();
    const responseQueue = "user_verify_response_queue";

    return new Promise((resolve, reject) => {
        // Store the resolve function in the correlationMap
        correlationMap.set(correlationId, resolve);

        channel.consume(
            responseQueue,
            (msg) => {
                const receivedCorrelationId = msg.properties.correlationId;
                if (correlationMap.has(receivedCorrelationId)) {
                    // Resolve the corresponding promise
                    const resolveFn = correlationMap.get(receivedCorrelationId);
                    resolveFn(JSON.parse(msg.content.toString()));

                    // Remove the correlationId from the map
                    correlationMap.delete(receivedCorrelationId);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

        channel.sendToQueue(
            "user_verify_request_queue",
            Buffer.from(
                JSON.stringify({
                    type: "USER_REQUEST",
                    userId,
                })
            ),
            { correlationId, replyTo: responseQueue }
        );
    });
};

// get vendor details
export const getVendorVerificationDetails = async (vendorId) => {
    const { channel } = await connectAMQP();
    const correlationId = uuidv4();
    const responseQueue = "vendor_verify_response_queue";

    return new Promise((resolve, reject) => {
        // Store the resolve function in the correlationMap
        correlationMap.set(correlationId, resolve);

        channel.consume(
            responseQueue,
            (msg) => {
                const receivedCorrelationId = msg.properties.correlationId;
                if (correlationMap.has(receivedCorrelationId)) {
                    // Resolve the corresponding promise
                    const resolveFn = correlationMap.get(receivedCorrelationId);
                    resolveFn(JSON.parse(msg.content.toString()));

                    // Remove the correlationId from the map
                    correlationMap.delete(receivedCorrelationId);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

        channel.sendToQueue(
            "vendor_verify_request_queue",
            Buffer.from(
                JSON.stringify({
                    type: "VENDOR_REQUEST",
                    vendorId,
                })
            ),
            { correlationId, replyTo: responseQueue }
        );
    });
};

// add vendor earnings
export const addVendorEarnings = async (vendor_Id, order_Id, order_amount) => {
    const { channel } = await connectAMQP();
    const correlationId = uuidv4();
    const responseQueue = "vendor_earnings_add_response_queue";

    return new Promise((resolve, reject) => {
        // Store the resolve function in the correlationMap
        correlationMap.set(correlationId, resolve);

        channel.consume(
            responseQueue,
            (msg) => {
                const receivedCorrelationId = msg.properties.correlationId;
                if (correlationMap.has(receivedCorrelationId)) {
                    // Resolve the corresponding promise
                    const resolveFn = correlationMap.get(receivedCorrelationId);
                    resolveFn(JSON.parse(msg.content.toString()));

                    // Remove the correlationId from the map
                    correlationMap.delete(receivedCorrelationId);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

        channel.sendToQueue(
            "vendor_earnings_add_request_queue",
            Buffer.from(
                JSON.stringify({
                    type: "VENDOR_EARNINGS_REQUEST",
                    vendor_Id,
                    order_Id,
                    order_amount,
                })
            ),
            { correlationId, replyTo: responseQueue }
        );
    });
};

// create a review of the product
export const createProductReview = async (
    user_id,
    order_id,
    product_id,
    review,
    rating
) => {
    const { channel } = await connectAMQP();
    const correlationId = uuidv4();
    const responseQueue = "product_review_add_response_queue";

    return new Promise((resolve, reject) => {
        // Store the resolve function in the correlationMap
        correlationMap.set(correlationId, resolve);

        channel.consume(
            responseQueue,
            (msg) => {
                const receivedCorrelationId = msg.properties.correlationId;
                if (correlationMap.has(receivedCorrelationId)) {
                    // Resolve the corresponding promise
                    const resolveFn = correlationMap.get(receivedCorrelationId);
                    resolveFn(JSON.parse(msg.content.toString()));

                    // Remove the correlationId from the map
                    correlationMap.delete(receivedCorrelationId);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

        channel.sendToQueue(
            "product_add_review_request_queue",
            Buffer.from(
                JSON.stringify({
                    type: "PRODUCT_REVIEW_REQUEST",
                    user_id,
                    order_id,
                    product_id,
                    review,
                    rating,
                })
            ),
            { correlationId, replyTo: responseQueue }
        );
    });
};
