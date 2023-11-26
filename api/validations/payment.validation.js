const Joi = require("joi");
const { roles } = require("../../config/vars");

module.exports = {
    intent: {
        body: Joi.object({
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
            uid: Joi.string().min(5).required(),
            amount: Joi.number().min(0).required(),
            paymentMethodType: Joi.string().required(),
            currency: Joi.string().required(),
            paymentMethodOptions: Joi.object(),
        }),
    },
    add: {
        body: Joi.object({
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
            name: Joi.string().min(1).max(50).allow("").allow(null),
            uid: Joi.string().min(5).required(),
            paymentId: Joi.string().min(5).required(),
            amount: Joi.number().min(0).required(),
        }),
    },
};
