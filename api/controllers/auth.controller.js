const User = require("../models/user.model");
const httpStatus = require("http-status");
const { omit, pick } = require("lodash");

exports.add = async (req, res, next) => {
    try {
        const userData = pick(
            omit(req.body, "role", "subscribed"),
            "email",
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

exports.sign = async (req, res, next) => {
    try {
        const { token } = await User.findAndGenerateToken(req.body);
        return res.json({
            token,
        });
    } catch (error) {
        return next(error);
    }
};
