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
        const pipeline = [
            {
                $match: {
                    $or: [{ email: this.email }, { uid: this.uid }],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "uid",
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

        const [result] = await mongoose
            .model("Product", productSchema)
            .aggregate(pipeline);

        if (result && !result.subscribed && result.productCount >= 1) {
            return next(
                new APIError({
                    message:
                        "User is not subscribed and can only add one product",
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
            "email",
            "uid",
            "name",
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

productSchema.post("find", async function (docs, next) {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "uid",
                    foreignField: "uid",
                    as: "userDetails",
                },
            },
            {
                $unwind: "$userDetails",
            },
            {
                $addFields: {
                    userDetails: {
                        uid: "$userDetails.uid",
                        email: "$userDetails.email",
                        name: "$userDetails.name",
                        userPhoto: "$userDetails.photoURL",
                    },
                },
            },
        ];

        const updatedProducts = await mongoose
            .model("Product")
            .aggregate(pipeline);

        updatedProducts.forEach((product) => {
            const originalProductIndex = docs.findIndex((doc) =>
                doc._id.equals(product._id)
            );

            if (originalProductIndex !== -1) {
                docs[originalProductIndex] = product;
            }
        });

        return next();
    } catch (error) {
        return next(error);
    }
});

productSchema.statics = {
    async get(options) {
        let products;

        try {
            products = await this.find({
                uid: options.uid,
                email: options.email,
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
