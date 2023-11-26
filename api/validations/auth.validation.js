const Joi = require("joi");
const { roles } = require("../../config/vars");

module.exports = {
    user: {
        body: Joi.object({
            email: Joi.string().email().required(),
            name: Joi.string().min(1).max(50).allow("").allow(null),
            uid: Joi.string().min(5).required(),
            photoURL: Joi.string()
                .uri({
                    scheme: ["http", "https"],
                })
                .allow("")
                .allow(null),
            subscribed: Joi.bool(),
            role: Joi.string().valid(...roles),
        }),
    },
};
