const mongoose = require("mongoose");
const APIError = require("../errors/api-error");
const httpStatus = require("http-status");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            min: 3,
            max: 100,
            required: true,
        },
        productPhoto: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            min: 3,
            max: 300,
            required: true,
        },
        productLink: {
            type: String,
            trim: true,
            required: true,
        },
        tags: {
            type: Array,
            default: [],
            required: true,
        },
        userEmail: {
            type: String,
            match: /^\S+@\S+\.\S+$/,
            required: true,
            trim: true,
            lowercase: true,
        },
        userUID: {
            type: String,
            trim: true,
            required: true,
        },
        approved: {
            type: Boolean,
            default: false,
        },
        upvote: {
            type: Number,
            default: 0,
        },
        downvote: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.pre("save", async function save(next) {
    try {
        const userEmail = this.userEmail;
        const userUID = this.userUID;

        const pipeline = [
            {
                $match: {
                    $or: [
                        { userEmail: userEmail },
                        { userUID: userUID },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userUID",
                    foreignField: "uid",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $group: {
                    _id: null,
                    subscribed: { $first: "$user.subscribed" },
                    productCount: { $sum: 1 },
                },
            },
        ];

        const [result] = await mongoose.model("Product", productSchema).aggregate(pipeline);


        if (result && !result.subscribed && result.productCount >= 1) {
            return next(
                new APIError({
                    message: "User is not subscribed and can only add one product",
                })
            );
        }

        return next();
    } catch (error) {
        return next(error);
    }
});

productSchema.method({
    transform() {
        const transformed = {};
        const fields = [
            "id",
            "productName",
            "productPhoto",
            "description",
            "productLink",
            "userEmail",
            "userUID",
            "userName",
            "approved",
            "upvote",
            "downvote",
            "createdAt",
        ];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },
});

productSchema.statics = {
    async get(options) {
        let products;

        try {
            products = await this.find({
                userUID: options.userUID,
                userEmail: options.userEmail,
            }).exec();
        } catch (error) {
            throw error;
        }
        if (products) {
            return products;
        }

        throw new APIError({
            message: "There is no products.",
            status: httpStatus.NOT_FOUND,
        });
    },
};

module.exports = mongoose.model("Product", productSchema);
