const httpStatus = require("http-status");
const Product = require("../models/product.model");
const { omit, mapValues } = require("lodash");

exports.list = async (req, res, next) => {
    try {
        const queryParams = req.query;
        const sortDirection = queryParams.sortDirection || "asc";
        const sortField = queryParams.sort;
        let postSort;

        const filteredParams = omit(
            queryParams,
            "sort",
            "sortDirection",
            "tag",
            "uid",
            "email",
            "status"
        );

        const { userUID, userEmail } = req.params;

        if (userUID) {
            filteredParams.uid = userUID;
        }

        if (userEmail) {
            filteredParams.email = userEmail;
        }

        const query = mapValues(filteredParams, (value) => value);

        // Set default status to "approved" if not provided
        const statusValue = queryParams.status || "approved";
        if (statusValue !== "all") {
            query.status = statusValue;
        }

        const sortOrder = sortDirection.toLowerCase() === "desc" ? -1 : 1;

        const sortObject = {};

        if (Array.isArray(sortField)) {
            const [field, value] = sortField;
            if (!isNaN(value)) sortObject[field] = value;
            else postSort = { field, value };
        } else {
            sortObject[sortField] = sortOrder;
        }
        console.log(queryParams, sortObject);

        const tagValue = queryParams.tag;
        if (tagValue) {
            query.tags = {
                $in: Array.isArray(tagValue) ? tagValue : [tagValue],
            };
        }

        let _products = await Product.find(query)
            .sort({})
            .populate("user")
            .exec();

        if (postSort) {
            console.log(sortDirection);
            _products = _products.sort((a, b) => {
                const sortOrder = sortDirection === "asc" ? 1 : -1;
                if (a.status === b.status) {
                    return 0;
                } else if (a[postSort.field] === postSort.value) {
                    return -1 * sortOrder;
                } else if (b.status === postSort.value) {
                    return 1 * sortOrder;
                } else {
                    return a.status.localeCompare(b.status) * sortOrder;
                }
            });
        }

        const products = _products.map((product) => product.transform());

        return res.json(products);
    } catch (error) {
        next(error);
    }
};

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
