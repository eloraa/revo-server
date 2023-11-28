const Joi = require("joi");

module.exports = {
    add: {
        body: Joi.object({
            code: Joi.string().min(3).max(100).required(),
            description: Joi.string().min(3).max(600).required(),
            discount: Joi.number().min(0).max(19).required(),
            accent: Joi.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i),
            expires: Joi.date().required(),
        }),
    },
};
