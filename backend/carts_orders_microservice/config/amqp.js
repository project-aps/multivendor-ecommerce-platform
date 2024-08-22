import amqp from "amqplib";

let channel = null;

export const connectAMQP = async () => {
    if (channel) return { channel };

    try {
        const connection = await amqp.connect(process.env.AMQP_URL);
        channel = await connection.createChannel();

        console.log("AMQP Server is Running");

        // Declare RPC queues

        // PRODUCT STOCKS REDUCE
        await channel.assertQueue("product_stock_request_queue");
        await channel.assertQueue("product_stock_response_queue");

        return { connection, channel };
    } catch (error) {
        console.error("Failed to connect to AMQP:", error);
        throw error;
    }
};
