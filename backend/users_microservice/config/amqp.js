import amqp from "amqplib";

let channel = null;

export const connectAMQP = async () => {
    if (channel) return { channel };

    try {
        const connection = await amqp.connect(process.env.AMQP_URL);
        channel = await connection.createChannel();

        console.log("AMQP Server is Running");

        // Declare RPC queues

        // USER VERIFICATION
        await channel.assertQueue("user_verify_request_queue");
        await channel.assertQueue("user_verify_response_queue");

        // USER ADDRESS
        await channel.assertQueue("user_address_request_queue");
        await channel.assertQueue("user_address_response_queue");

        // USER DETAILS
        await channel.assertQueue("user_details_request_queue");
        await channel.assertQueue("user_details_response_queue");

        return { connection, channel };
    } catch (error) {
        console.error("Failed to connect to AMQP:", error);
        throw error;
    }
};
