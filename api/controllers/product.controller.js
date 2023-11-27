const httpStatus = require("http-status");
const Product = require("../models/product.model");

exports.get = async (req, res, next) => {
    try {
        const products = await Product.get(req.query);

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
