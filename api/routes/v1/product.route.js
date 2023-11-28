const express = require("express");
const controller = require("../../controllers/product.controller");

const {
    authorize,
    LOGGED_USER,
    FORCED,
    MODERATOR,
} = require("../../middlewares/auth");
const { validate } = require("express-validation");
const {
    product,
    deletes,
    status,
} = require("../../validations/product.validation");
const { get } = require("../../validations/auth.validation");

const router = express.Router();

router
    .route("/")

    .get(
        authorize(FORCED, { roles: MODERATOR, schema: status }),
        validate(status),
        controller.list
    );

router
    .route("/get")

    .get(validate(get), authorize(LOGGED_USER), controller.get);

router
    .route("/add")

    .post(validate(product), authorize(LOGGED_USER), controller.add);

router
    .route("/:id")

    .delete(
        validate(get),
        validate(deletes),
        authorize(LOGGED_USER),
        controller.delete
    );

module.exports = router;
