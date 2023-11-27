const httpStatus = require("http-status");
const Product = require("../models/product.model");

exports.get = async (req, res, next) => {
    try {
        const _products = await Product.get(req.query);
        const products = _products.map((product) => product.transform());

        return res.json(products);
    } catch (error) {
        next(error);
    }
};

exports.add = async (req, res, next) => {
    try {
        await new Product(req.body).save();
        res.status(httpStatus.CREATED);
        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const result = await Product.deleteOne({ _id: req.params.id });
        if (result.deletedCount) {
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
