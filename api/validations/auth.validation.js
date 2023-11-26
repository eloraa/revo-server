const Joi = require("joi");

module.exports = {
    user: {
        body: Joi.object({
            email: Joi.string().email().required(),
            uid: Joi.string().min(5).required(),
            photoURL: Joi.string().regex(/((https?|www):\/\/)[-a-zA-Z0-9+&@#/%=~_|$?!:,.]*[-a-zA-Z0-9+&@#/%=~_|$]/),
        }),
    },
};
