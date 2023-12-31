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
    set: {
        body: Joi.object({
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
            uid: Joi.string().min(5).required(),
            status: Joi.string()
                .valid("approved", "rejected", "featured", "removefeatured")
                .required(),
        }),
    },
    status: {
        query: Joi.object({
            status: Joi.string().valid(
                "pending",
                "approved",
                "rejected",
                "all"
            ),
        }).unknown(true),
    },
    token: {
        query: Joi.object({
            hasToken: Joi.boolean(),
        }).unknown(true),
    },
    vote: {
        body: Joi.object({
            type: Joi.string().valid("upvote", "downvote"),
        }),
    },
};
