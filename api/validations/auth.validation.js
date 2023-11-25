const Joi = require("joi");

module.exports = {
    user: {
        body: Joi.object({
            email: Joi.string().email().required(),
            uid: Joi.string().min(5).required(),
        }),
    },
};
