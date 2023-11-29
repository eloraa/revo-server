const httpStatus = require("http-status");
const Review = require("../models/review.model");

exports.add = async (req, res, next) => {
    try {
        await new Review(req.body).save();
        res.status(httpStatus.CREATED);
        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
};


