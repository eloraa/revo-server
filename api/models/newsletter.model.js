const mongoose = require("mongoose");
const APIError = require("../errors/api-error");
const httpStatus = require("http-status");

const newsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

newsletterSchema.statics = {
    checkDuplicateEmail(error) {
        console.log(error.code);
        if (error.name === "MongoServerError" && error.code === 11000) {
            return new APIError({
                message: "Validation Error",
                errors: [
                    {
                        field: "email",
                        location: "body",
                        messages: ['"email" already exists'],
                    },
                ],
                status: httpStatus.CONFLICT,
                isPublic: true,
                stack: error.stack,
            });
        }
        return error;
    },
};

module.exports = mongoose.model("Newsletter", newsletterSchema);
