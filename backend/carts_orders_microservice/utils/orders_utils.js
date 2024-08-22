export const get_shipping_fee = () => {
    return 150;
};

export const verify_payment = (
    payment_method,
    payment_gateway,
    txn_id,
    amount
) => {
    // we verify the payment using the payment gateway
    // For now, we are just returning true for COD

    if (payment_method == "COD") {
        return true;
    }
    // verify other payment gateways verification
    return true;
};
