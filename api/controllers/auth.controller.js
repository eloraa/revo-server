const User = require("../models/user.model");
const httpStatus = require("http-status");
const { omit, pick } = require("lodash");
const { setCustomClaims } = require("../../config/firebase");

exports.list = async (req, res, next) => {
    try {
        const users = await User.find();
        const transformedUsers = users.map((user) => user.transform());

        return res.json(transformedUsers);
    } catch (error) {
        next(error);
    }
};

exports.add = async (req, res, next) => {
    try {
        const userData = pick(
            omit(req.body, "role", "subscribed"),
            "email",
            "name",
            "uid",
            "photoURL"
        );
        const user = await new User(userData).save();
        const token = user.token();
        res.status(httpStatus.CREATED);
        return res.json({
            token,
        });
    } catch (error) {
        return next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        let userData;

        if (req.user.role !== "admin") {
            userData = pick(req.body, "name", "photoURL");
        } else {
            userData = pick(req.body, "role", "name", "photoURL");

            if (userData.role)
                await setCustomClaims(userData.role, req.body.email, true);
        }
        const user = await User.findOneAndUpdate(
            { uid: req.body.uid, email: req.body.email },
            userData
        );
        const token = user.token();
        res.status(httpStatus.CREATED);
        return res.json({
            token,
        });
    } catch (error) {
        return next(error);
    }
};

exports.claims = async (req, res, next) => {
    try {
        const userData = pick(req.body, "role");

        const user = await User.updateOne(
            { uid: req.body.userUID, email: req.body.userEmail },
            userData,
            { auth: req.auth }
        );
        if (user.modifiedCount) {
            setCustomClaims(userData.role, req.body.userEmail, true);
            res.status(httpStatus.CREATED);
            return res.json({
                success: true,
            });
        } else {
            res.status(httpStatus.NOT_MODIFIED);
            return res.json({
                success: false,
            });
        }
    } catch (error) {
        return next(error);
    }
};
exports.sign = async (req, res, next) => {
    try {
        const { token } = await User.findAndGenerateToken(
            pick(req.body, "email", "uid")
        );
        return res.json({
            token,
        });
    } catch (error) {
        return next(error);
    }
};
