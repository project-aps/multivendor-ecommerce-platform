import { connectAMQP } from "../config/amqp.js";
import { dbQuery } from "../db/db.js";

export const processVendorRequests = async () => {
    const { channel } = await connectAMQP();

    // user verification request
    channel.consume("vendor_verify_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "VENDOR_REQUEST") {
            const user = await getVendorById(request.vendorId);
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "VENDOR_RESPONSE",
                        data: user,
                        correlationId: msg.properties.correlationId,
                    })
                ),
                { correlationId: msg.properties.correlationId }
            );
        }
        channel.ack(msg);
    });

    // vendor earnings request
    channel.consume("vendor_earnings_add_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "VENDOR_EARNINGS_REQUEST") {
            console.log(request);
            const result = await addVendorEarnings(
                request.vendor_Id,
                request.order_Id,
                request.order_amount
            );
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "VENDOR_EARNINGS_RESPONSE",
                        data: result,
                        correlationId: msg.properties.correlationId,
                    })
                ),
                { correlationId: msg.properties.correlationId }
            );
        }
        channel.ack(msg);
    });
};

// db queries
const getVendorById = async (userId) => {
    // fetch admin details from database and return
    try {
        const result = await dbQuery(
            "SELECT id, business_name, description, email, status FROM vendors WHERE id = $1",
            [userId]
        );
        if (result.rows.length === 0) {
            return {
                success: false,
                statusCode: 404,
                message: "Vendor not found",
            };
        }
        const user = result.rows[0];
        return {
            success: true,
            data: user,
            message: "Vendor profile retrieved successfully",
        };
    } catch (error) {
        console.error("Error in getVendorProfile:", error);
        return {
            success: false,
            statusCode: 500,
            message: "Error retrieving vendor profile",
            error: error.message,
        };
    }
};

// add vendor earnings and add total_income
const addVendorEarnings = async (vendor_Id, order_Id, order_amount) => {
    try {
        await dbQuery("BEGIN");

        // TODO 5 percent commission is the platform fee
        const total_earned = Math.floor(order_amount * 0.95);
        const platform_fee = order_amount - total_earned;

        const vendor_earning_result = await dbQuery(
            "INSERT INTO vendor_earnings (vendor_id, order_id, order_amount, platform_fee, total_earned) VALUES ($1, $2, $3, $4, $5) RETURNING id ",
            [vendor_Id, order_Id, order_amount, platform_fee, total_earned]
        );

        if (vendor_earning_result.rows.length == 0) {
            await dbQuery("ROLLBACK");
            return {
                success: false,
                statusCode: 500,
                message: "Error adding vendor earnings",
            };
        }
        const result = await dbQuery(
            "UPDATE vendors SET total_income = total_income + $1 WHERE id = $2 RETURNING total_income",
            [total_earned, vendor_Id]
        );

        if (result.rows.length === 0) {
            await dbQuery("ROLLBACK");
            return {
                success: false,
                statusCode: 500,
                message: "Error updating vendor earnings",
            };
        }

        await dbQuery("COMMIT");
        return {
            success: true,
            data: result.rows[0],
            message: "Vendor earnings updated successfully",
        };
    } catch (error) {
        await dbQuery("ROLLBACK");
        console.error("Error in addVendorEarnings:", error);
        return {
            success: false,
            message: "Error updating vendor earnings",
            error: error.message,
        };
    }
};
