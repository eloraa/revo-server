const { pick } = require("lodash");
const httpStatus = require("http-status");
const Coupon = require("../models/coupons.model");

exports.list = async (req, res, next) => {
    try {
        const _coupons = await Coupon.find();
        const coupons = _coupons.map((coupon) => coupon.transform());

        return res.json(coupons);
    } catch (error) {
        return next(error);
    }
};

exports.add = async (req, res, next) => {
    try {
        const couponData = pick(
            req.body,
            "code",
            "description",
            "discount",
            "accent",
            "expires"
        );
        await new Coupon(couponData).save();
        res.status(httpStatus.CREATED);
        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const couponData = pick(
            req.body,
            "code",
            "description",
            "discount",
            "accent",
            "expires"
        );
        const result = await Coupon.updateOne(
            { _id: req.params.id },
            couponData
        );
        if (result.modifiedCount) {
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

exports.delete = async (req, res, next) => {
    try {
        const result = await Coupon.deleteOne({ _id: req.params.id });
        if (result.deletedCount) {
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
