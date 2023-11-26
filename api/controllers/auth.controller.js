const User = require("../models/user.model");
const httpStatus = require("http-status");
const { omit, pick } = require("lodash");

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
            userData = pick(req.body, "role", "subscribed", "name", "photoURL");
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

exports.sign = async (req, res, next) => {
    try {
        const { token } = await User.findAndGenerateToken(pick(req.body, "email", "uid"));
        return res.json({
            token,
        });
    } catch (error) {
        return next(error);
    }
};
