const Stripe = require("stripe");
const { stripeSecretKey } = require("../../config/vars");
const { pick } = require("lodash");
const Payment = require("../models/payment.model");
const httpStatus = require("http-status");

const stripe = Stripe(stripeSecretKey);
exports.intent = async (req, res, next) => {
    try {
        const {
            paymentMethodType,
            amount,
            currency,
            email,
            paymentMethodOptions,
        } = req.body;

        // Each payment method type has support for different currencies. In order to
        // support many payment method types and several currencies, this server
        // endpoint accepts both the payment method type and the currency as
        // parameters. To get compatible payment method types, pass
        // `automatic_payment_methods[enabled]=true` and enable types in your dashboard
        // at https://dashboard.stripe.com/settings/payment_methods.
        //
        // Some example payment method types include `card`, `ideal`, and `link`.
        const params = {
            payment_method_types:
                paymentMethodType === "link"
                    ? ["link", "card"]
                    : [paymentMethodType],
            amount: amount * 100,
            receipt_email: email,
            description: "Thanks for your subscription!",
            currency: currency,
        };

        // If this is for an ACSS payment, we add payment_method_options to create
        // the Mandate.
        if (paymentMethodType === "acss_debit") {
            params.payment_method_options = {
                acss_debit: {
                    mandate_options: {
                        payment_schedule: "sporadic",
                        transaction_type: "personal",
                    },
                },
            };
        } else if (paymentMethodType === "konbini") {
            /**
             * Default value of the payment_method_options
             */
            params.payment_method_options = {
                konbini: {
                    product_description: "Tシャツ",
                    expires_after_days: 3,
                },
            };
        } else if (paymentMethodType === "customer_balance") {
            params.payment_method_data = {
                type: "customer_balance",
            };
            params.confirm = true;
            params.customer = await stripe.customers
                .create()
                .then((data) => data.id);
        }

        /**
         * If API given this data, we can overwride it
         */
        if (paymentMethodOptions) {
            params.payment_method_options = paymentMethodOptions;
        }

        // Create a PaymentIntent with the amount, currency, and a payment method type.
        //
        // See the documentation [0] for the full list of supported parameters.
        //
        // [0] https://stripe.com/docs/api/payment_intents/create
        try {
            const paymentIntent = await stripe.paymentIntents.create(params);

            // Send publishable key and PaymentIntent details to client
            return res.json({
                clientSecret: paymentIntent.client_secret,
                nextAction: paymentIntent.next_action,
            });
        } catch (e) {
            return res.json({
                error: {
                    message: e.message,
                },
            });
        }
    } catch (error) {
        return next(error);
    }
};

exports.add = async (req, res, next) => {
    try {
        const paymentData = pick(req.body, "email", "name", "uid", "paymentId", "amount");
        const payment = (await new Payment(paymentData).save()).transform();
        res.status(httpStatus.CREATED);
        return res.json({
            success: true,
            paymentId: payment.paymentId,
        });
    } catch (error) {
        return next(error);
    }
};
