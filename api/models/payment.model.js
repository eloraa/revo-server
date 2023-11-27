const mongoose = require("mongoose");
const User = require("./user.model");
const { setCustomClaims } = require("../../config/firebase");

const paymentSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            match: /^\S+@\S+\.\S+$/,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        name: {
            type: String,
            min: 3,
            max: 50,
        },
        uid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        paymentId: {
            type: String,
            min: 5,
            required: true,
        },
        amount: {
            type: Number,
            min: 0,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.post("save", async function save(doc, next) {
    try {
        const user = await User.findOneAndUpdate(
            { uid: this.uid, email: this.email },
            { subscribed: true }
        );
        if (user.isModified) {
            setCustomClaims("subscribed", this.email, true);
        }
        return next();
    } catch (error) {
        return next(error);
    }
});

paymentSchema.index({ uid: 1, email: 1 }, { unique: true });

paymentSchema.method({
    transform() {
        const transformed = {};
        const fields = ["id", "email", "uid", "paymentId", "createdAt"];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },
});

module.exports = mongoose.model("Payment", paymentSchema);
