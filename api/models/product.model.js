const mongoose = require("mongoose");
const APIError = require("../errors/api-error");
const httpStatus = require("http-status");
const Vote = require("./vote.model");

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
        status: {
            type: String,
            default: "pending",
        },
        reported: {
            type: Boolean,
            default: false,
        },
        featured: {
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.virtual("user", {
    ref: "User",
    localField: "uid",
    foreignField: "uid",
    justOne: true,
});

productSchema.virtual("review", {
    ref: "Review",
    localField: "_id",
    foreignField: "productId",
});

productSchema.virtual("vote", {
    ref: "Vote",
    localField: "_id",
    foreignField: "productId",
});

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
productSchema.pre("updateOne", async function (next) {
    try {
        const doc = await this.model.findOne(this.getQuery());

        if (
            this.getUpdate().$set &&
            this.getUpdate().$set.featured === true &&
            doc.status !== "approved"
        ) {
            return next(
                new APIError({
                    message:
                        "Cannot set featured for a product that is not approved",
                })
            );
        }

        if (
            this.getUpdate().$set &&
            this.getUpdate().$set.reported === true &&
            doc.status !== "approved"
        ) {
            return next(
                new APIError({
                    message: "Cannot report a product that is not approved",
                })
            );
        }

        const auth = this.options?.auth;
        const { upvote, downvote } = this.getUpdate().$inc || {};

        try {
            const voteType =
                upvote && upvote > 0
                    ? "upvote"
                    : downvote && downvote > 0
                    ? "downvote"
                    : null;

            if (voteType) {
                // Check if the user has already voted
                const existingVote = await Vote.findOne({
                    uid: auth.sub,
                    email: auth.email,
                    productId: doc._id,
                });

                if (existingVote) {
                    return next(
                        new APIError({
                            message: "User already voted this product.",
                        })
                    );
                }

                if (doc.uid === auth.sub) {
                    return next(
                        new APIError({
                            message: "User cannot vote on their own product.",
                        })
                    );
                }

                // Continue with voting logic
                await handleVote(doc, voteType, auth.sub, auth.email);
            }
        } catch (err) {
            return next(err);
        }

        next();
    } catch (error) {
        return next(error);
    }
});

async function handleVote(product, voteType, uid, email) {
    const { _id } = product;
    await Vote.create({
        productId: _id,
        uid,
        email,
        voteType,
    });
}

productSchema.method({
    transform() {
        const transformed = {};
        const fields = [
            "id",
            "productName",
            "productPhoto",
            "description",
            "productLink",
            "status",
            "reported",
            "featured",
            "tags",
            "upvote",
            "downvote",
            "user",
            "review",
            "vote",
            "createdAt",
        ];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },
});

// productSchema.post("find", async function (docs, next) {
//     try {
//         const pipeline = [
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "uid",
//                     foreignField: "uid",
//                     as: "userDetails",
//                 },
//             },
//             {
//                 $unwind: "$userDetails",
//             },
//             {
//                 $addFields: {
//                     userDetails: {
//                         uid: "$userDetails.uid",
//                         email: "$userDetails.email",
//                         name: "$userDetails.name",
//                         userPhoto: "$userDetails.photoURL",
//                     },
//                 },
//             },
//         ];

//         const updatedProducts = await mongoose
//             .model("Product")
//             .aggregate(pipeline);

//         updatedProducts.forEach((product) => {
//             const originalProductIndex = docs.findIndex((doc) =>
//                 doc._id.equals(product._id)
//             );

//             if (originalProductIndex !== -1) {
//                 docs[originalProductIndex] = product;
//             }
//         });

//         return next();
//     } catch (error) {
//         return next(error);
//     }
// });

productSchema.statics = {
    async get(options) {
        let products;

        try {
            products = await this.find({
                uid: options.uid,
                email: options.email,
            })
                .populate("user")
                .populate("vote")
                .populate("review")
                .exec();
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
