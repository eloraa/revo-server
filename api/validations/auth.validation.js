const Joi = require("joi");
const { roles } = require("../../config/vars");

module.exports = {
    user: {
        body: Joi.object({
            email: Joi.string().email().required(),
            name: Joi.string().min(3).max(50),
            uid: Joi.string().min(5).required(),
            photoURL: Joi.string().regex(/((https?|www):\/\/)[-a-zA-Z0-9+&@#/%=~_|$?!:,.]*[-a-zA-Z0-9+&@#/%=~_|$]/),
            subscribed: Joi.bool(),
            role: Joi.string().valid(...roles),
        }),
    },
};
