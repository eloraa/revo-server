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
            "tags",
            "uid",
            "email",
            "status",
            "limit",
            "pagination",
            "page"
        );

        const { userUID, userEmail } = req.params;

        if (userUID) {
            filteredParams.uid = userUID;
        }

        if (userEmail) {
            filteredParams.email = userEmail;
        }

        const query = mapValues(filteredParams, (value) => {
            if (
                value.toLowerCase() === "true" ||
                value.toLowerCase() === "false"
            ) {
                return value.toLowerCase() === "true";
            } else if (!isNaN(value)) {
                return Number(value);
            } else {
                return value;
            }
        });

        const statusValue = queryParams.status || "approved";
        if (statusValue !== "all") {
            query.status = statusValue;
        }

        const sortOrder = sortDirection.toLowerCase() === "desc" ? -1 : 1;

        const sortObject = {};

        if (sortField && Array.isArray(sortField)) {
            const [field, value] = sortField;
            if (!isNaN(value)) sortObject[field] = Number(value);
            else postSort = { field, value };
        } else {
            sortObject[sortField] = sortOrder;
        }

        const tagValue = queryParams.tags;
        if (tagValue) {
            const tagSearchRegexArray = Array.isArray(tagValue)
                ? tagValue.map((tag) => new RegExp(tag, "i"))
                : [new RegExp(tagValue, "i")];

            query.tags = {
                $in: tagSearchRegexArray,
            };
        }

        let queryBuilder = Product.find(query)
            .sort(sortObject)
            .populate("user")
            .populate("vote")
            .populate("review");

        const paginationValue = queryParams.pagination;
        const limitValue = queryParams.limit;
        let usePagination = false;
        let limit;

        if (
            paginationValue &&
            paginationValue.toLowerCase() === "true" &&
            limitValue
        ) {
            usePagination = true;
            limit = parseInt(limitValue, 10);
            queryBuilder = queryBuilder.limit(limit);

            if (usePagination) {
                const page = parseInt(queryParams.page, 10) || 1;
                queryBuilder = queryBuilder.skip((page - 1) * limit);
            }
        } else if (limitValue) {
            limit = parseInt(limitValue, 10);
            queryBuilder = queryBuilder.limit(limit);
        }

        let _products = await queryBuilder.exec();

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

        if (usePagination) {
            const totalProducts = await Product.countDocuments(query).exec();
            const totalPages = Math.ceil(totalProducts / limit);
            const paginationData = {
                page: parseInt(queryParams.page, 10) || 1,
                limit,
                totalProducts,
                totalPages,
            };
            return res.json({ products, pagination: paginationData });
        } else {
            return res.json(products);
        }
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

exports.vote = async (req, res, next) => {
    try {
        const updateField = req.body.type === "upvote" ? "upvote" : "downvote";

        const result = await Product.updateOne(
            { _id: req.params.id },
            { $inc: { [updateField]: 1 } },
            { auth: req.auth }
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
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const product = (
            await Product.findOne({ _id: req.params.id })
                .populate("user")
                .populate("vote")
                .populate("review")
        ).transform();

        if (
            (req.query.hasToken &&
                req.auth &&
                (req.auth.roles === "admin" ||
                    req.auth.roles === "moderator")) ||
            (product.user?.email === req.auth?.email &&
                product.user?.uid === req.auth.sub)
        ) {
            return res.json(product);
        } else if (product.status === "approved") {
            return res.json(product);
        } else {
            return res.json(null);
        }
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

exports.update = async (req, res, next) => {
    try {
        const result = await Product.updateOne(
            {
                _id: req.params.id,
                email: req.body.email,
                uid: req.body.uid,
            },
            omit(
                req.body,
                "email",
                "uid",
                "status",
                "approved",
                "featured",
                "reported"
            )
        );
        if (result.modifiedCount) {
            return res.json({
                success: true,
            });
        } else {
            res.status(httpStatus.NOT_MODIFIED);
            return res.json({
                success: true,
            });
        }
    } catch (error) {
        return next(error);
    }
};

exports.set = async (req, res, next) => {
    try {
        const result = await Product.updateOne(
            { _id: req.params.id },
            {
                $set:
                    req.body.status === "featured"
                        ? { featured: true }
                        : req.body.status === "removefeatured"
                        ? { featured: false }
                        : { status: req.body.status },
            }
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

exports.report = async (req, res, next) => {
    try {
        const result = await Product.updateOne(
            { _id: req.params.id },
            { $set: { reported: req.body.reported ? true : false } }
        );
        if (result.modifiedCount) {
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
