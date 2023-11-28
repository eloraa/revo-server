const httpStatus = require("http-status");
const Newsletter = require("../models/newsletter.model");

exports.add = async (req, res, next) => {
    try {
        await new Newsletter(req.body).save();
        res.status(httpStatus.CREATED);
        return res.json({
            success: true,
        });
    } catch (error) {
        return next(Newsletter.checkDuplicateEmail(error));
    }
};
