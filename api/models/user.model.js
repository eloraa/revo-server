const mongoose = require("mongoose");
const APIError = require("../errors/api-error");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const { jwtSecret, jwtExpirationInterval } = require("../../config/vars");

const roles = ["admin", "moderator", "normal"];

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            match: /^\S+@\S+\.\S+$/,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        subscribed: {
            type: Boolean,
            default: false,
        },
        photoURL: {
            type: String,
            trim: true,
            default: null,
        },
        uid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        role: {
            type: String,
            enum: roles,
            default: "normal",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.method({
    transform() {
        const transformed = {};
        const fields = [
            "id",
            "email",
            "subscribed",
            "uid",
            "role",
            "createdAt",
        ];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },
    token() {
        const payload = {
            exp: moment().add(jwtExpirationInterval, "minutes").unix(),
            iat: moment().unix(),
            sub: this.uid,
        };
        return jwt.sign(payload, jwtSecret);
    },
    userMatches(uid) {
        return uid === this.uid;
    },
    isSubscribed() {
        return this.subscribed;
    },
});

userSchema.statics = {
    roles,
    async get(options) {
        let user;

        try {
            user = await this.findOne({
                uid: options.uid,
                email: options.email,
            }).exec();
        } catch (error) {
            throw error;
        }
        if (user) {
            return user;
        }

        throw new APIError({
            message: "User does not exist",
            status: httpStatus.NOT_FOUND,
        });
    },
    async findAndGenerateToken(options) {
        const { email, uid } = options;
        if (!email || !uid) {
            throw new APIError({
                message: "An email and uid is required to generate a token",
            });
        }

        const user = await this.findOne({
            email,
            uid,
        }).exec();
        const err = {
            status: httpStatus.UNAUTHORIZED,
            isPublic: true,
        };
        if (user) {
            return {
                user,
                token: user.token(),
            };
        }
        err.message = "Incorrect email or uid";
        throw new APIError(err);
    },
};

module.exports = mongoose.model("User", userSchema);
