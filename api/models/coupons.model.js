const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            min: 3,
            max: 100,
            unique: true,
            required: true,
        },
        description: {
            type: String,
            min: 3,
            max: 600,
            required: true,
        },
        discount: {
            type: Number,
            min: 0,
            max: 19,
            required: true,
        },
        accent: {
            type: String,
            match: [/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, "Invalid color format."],
            default: "#000",
        },
        expires: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

couponSchema.method({
    transform() {
        const transformed = {};
        const fields = [
            "id",
            "code",
            "description",
            "discount",
            "accent",
            "expires",
            "createdAt",
        ];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },
});

module.exports = mongoose.model("Coupon", couponSchema);
