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
        const userTransformed = user.transform();
        const token = user.token();
        res.status(httpStatus.CREATED);
        return res.json({
            token,
            user: userTransformed,
        });
    } catch (error) {
        return next(error);
    }
};
