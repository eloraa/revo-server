const mongoose = require("mongoose");
const APIError = require("../errors/api-error");
const Product = require("./product.model");

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

reviewSchema.pre("save", async function save(next) {
    try {
        const doc = await Product.findById(this.productId);

        if (doc.status !== "approved") {
            return next(
                new APIError({
                    message: "You can't review a product that is not approved",
                })
            );
        }

        return next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model("Review", reviewSchema);
