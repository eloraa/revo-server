const Joi = require("joi");

module.exports = {
    user: {
        body: {
            email: Joi.string().email().required(),
            uid: Joi.string().min(5).required(),
        },
    },
};
