const mongoose = require("mongoose");
const APIError = require("../errors/api-error");
const httpStatus = require("http-status");
const Vote = require("./vote.model");

const reviewSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            match: /^\S+@\S+\.\S+$/,
            required: true,
            trim: true,
            lowercase: true,
        },
        uid: {
            type: String,
            trim: true,
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        review: {
            type: String,
            min: 0,
            max: 500,
            required: true,
        },
        ratings: {
            type: Number,
            min: 0,
            max: 5,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.virtual("user", {
    ref: "User",
    localField: "uid",
    foreignField: "uid",
    justOne: true,
    autoPopulate: true,
});

reviewSchema.pre("find", function (next) {
    this.populate("user");
    next();
});

reviewSchema.post("find", function (docs, next) {
    if (Array.isArray(docs)) {
        docs = docs.map((doc) => doc.transform());
    } else {
        docs = docs.transform();
    }
    next();
});

reviewSchema.method({
    transform() {
        const transformed = {};
        const fields = [
            "id",
            "review",
            "ratings",
            "productId",
            "user",
            "createdAt",
        ];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },
});

module.exports = mongoose.model("Review", reviewSchema);
