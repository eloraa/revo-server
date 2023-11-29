const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        uid: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        voteType: {
            type: String,
            enum: ["upvote", "downvote"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Vote", voteSchema);
