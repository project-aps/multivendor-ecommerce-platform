import { connectAMQP } from "../config/amqp.js";
import { dbQuery } from "../db/db.js";

export const processAdminRequests = async () => {
    const { channel } = await connectAMQP();

    // user verification request
    channel.consume("admin_verify_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "ADMIN_REQUEST") {
            const user = await getUserById(request.userId);
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "ADMIN_RESPONSE",
                        data: user,
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
const getUserById = async (userId) => {
    // fetch admin details from database and return
    try {
        const result = await dbQuery(
            "SELECT id, name, email FROM admins WHERE id = $1",
            [userId]
        );
        if (result.rows.length === 0) {
            return {
                success: false,
                statusCode: 404,
                message: "Admin not found",
            };
        }
        const user = result.rows[0];
        return {
            success: true,
            data: user,
            message: "Admin profile retrieved successfully",
        };
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        return {
            success: false,
            statusCode: 500,
            message: "Error retrieving admin profile",
            error: error.message,
        };
    }
};
