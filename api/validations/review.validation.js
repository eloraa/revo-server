const Joi = require("joi");

module.exports = {
    review: {
        body: Joi.object({
            productId: Joi.string()
                .regex(/^[a-fA-F0-9]{24}$/)
                .required(),
            review: Joi.string().min(3).max(500).required(true),
            ratings: Joi.number().integer().max(5).min(0).required(),
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
            uid: Joi.string().min(5).required(),
        }),
    },
};
