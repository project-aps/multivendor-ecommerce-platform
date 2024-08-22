import { connectAMQP } from "../config/amqp.js";
import { dbQuery } from "../db/db.js";

export const processUserRequests = async () => {
    const { channel } = await connectAMQP();

    // user address request
    channel.consume("user_address_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "USER_REQUEST") {
            console.log("\n----------------------------");
            console.log("user address request received in userMicroservice");
            console.log(msg.properties.correlationId);
            const user_address = await getUserAddressById(
                request.addressId,
                request.userId
            );
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "USER_RESPONSE",
                        data: user_address,
                        correlationId: msg.properties.correlationId,
                    })
                ),
                { correlationId: msg.properties.correlationId }
            );
            console.log("user address responded from userMicroservice");
            console.log(msg.properties.correlationId);
        }
        channel.ack(msg);
    });

    // user verification request
    channel.consume("user_verify_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "USER_REQUEST") {
            const user = await getUserById(request.userId);
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "USER_RESPONSE",
                        data: user,
                        correlationId: msg.properties.correlationId,
                    })
                ),
                { correlationId: msg.properties.correlationId }
            );
        }
        channel.ack(msg);
    });

    // user details request
    channel.consume("user_details_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "USER_REQUEST") {
            const users = await getArrayOfUsers(request.user_ids);
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "USER_RESPONSE",
                        data: users,
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
const getUserAddressById = async (addressId, userId) => {
    // fetch user details from database and return
    console.log(addressId, userId);
    try {
        const result = await dbQuery(
            "SELECT * FROM addresses WHERE id = $1 AND user_id = $2",
            [addressId, userId]
        );
        if (result.rows.length === 0) {
            return {
                success: false,
                statusCode: 404,
                message: "User not found",
            };
        }
        const user = result.rows[0];
        return {
            success: true,
            data: user,
            message: "User profile retrieved successfully",
        };
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        return {
            success: false,
            statusCode: 500,
            message: "Error retrieving user profile",
            error: error.message,
        };
    }
};

const getUserById = async (userId) => {
    // fetch user details from database and return
    try {
        const result = await dbQuery(
            "SELECT id, name, email FROM users WHERE id = $1",
            [userId]
        );
        if (result.rows.length === 0) {
            return {
                success: false,
                statusCode: 404,
                message: "User not found",
            };
        }
        const user = result.rows[0];
        return {
            success: true,
            data: user,
            message: "User profile retrieved successfully",
        };
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        return {
            success: false,
            statusCode: 500,
            message: "Error retrieving user profile",
            error: error.message,
        };
    }
};

// get user name by of all user_ids in array form
const getArrayOfUsers = async (user_ids) => {
    try {
        // Validate input
        console.log(user_ids);

        if (!Array.isArray(user_ids) || user_ids.length === 0) {
            return {
                success: false,
                statusCode: 404,
                message: "Invalid input. Please provide an array of user_ids.",
            };
        }

        // Query the database to fetch users by IDs
        const query = `
            SELECT id, name, email 
            FROM users
            WHERE id = ANY($1::int[])
        `;
        const values = [user_ids];
        const result = await dbQuery(query, values);

        // Return the user details
        return {
            success: true,
            message: "User details fetched successfully.",
            data: result.rows,
        };
    } catch (error) {
        console.error("Error fetching user details:", error);
        return {
            success: false,
            statusCode: 500,
            message: "Error fetching user details",
            error: error.message,
        };
    }
};
