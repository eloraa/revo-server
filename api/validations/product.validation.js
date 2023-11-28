const Joi = require("joi");
const { roles } = require("../../config/vars");

module.exports = {
    product: {
        body: Joi.object({
            productName: Joi.string().min(1).max(100).required(),
            productPhoto: Joi.string().uri().required(),
            description: Joi.string().min(1).max(300).required(),
            productLink: Joi.string().uri().required(),
            tags: Joi.array().required(),
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
            uid: Joi.string().min(5).required(),
        }),
    },
    deletes: {
        params: Joi.object({
            id: Joi.string()
                .regex(/^[a-fA-F0-9]{24}$/)
                .required(),
        }),
    },
    status: {
        query: Joi.object({
            status: Joi.string().valid("pending", "approved", "rejected"),
        }).unknown(true),
    },
};
