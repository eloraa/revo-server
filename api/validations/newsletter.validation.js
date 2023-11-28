const Joi = require("joi");

module.exports = {
    add: {
        body: Joi.object({
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
        }),
    },
};
