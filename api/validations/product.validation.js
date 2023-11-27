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
            userEmail: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
            userUID: Joi.string().min(5).required(),
        }),
    },
};
