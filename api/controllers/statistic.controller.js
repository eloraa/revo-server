const Product = require("../models/product.model");
const Review = require("../models/review.model");
const User = require("../models/user.model");

exports.statistic = async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalUsers = await User.countDocuments();

        const statistics = {
            totalProducts,
            totalReviews,
            totalUsers,
        };

        res.json(statistics);
    } catch (error) {
        return next(error);
    }
};
