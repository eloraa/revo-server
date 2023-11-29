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
    set,
    token,
    vote,
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
    .route("/get/:id")

    .get(
        authorize(FORCED, { roles: LOGGED_USER, schema: token }),
        validate(token),
        controller.getOne
    );

router
    .route("/get")

    .get(validate(get), authorize(LOGGED_USER), controller.get);

router
    .route("/add")

    .post(validate(product), authorize(LOGGED_USER), controller.add);

router
    .route("/update/:id")

    .patch(validate(product), authorize(LOGGED_USER), controller.update);

router
    .route("/:id")

    .delete(
        validate(get),
        validate(deletes),
        authorize(LOGGED_USER),
        controller.delete
    );

router
    .route("/set-status/:id")

    .patch(authorize(MODERATOR), validate(set), controller.set);

router
    .route("/vote/:id")

    .patch(authorize(LOGGED_USER), validate(vote), controller.vote);

router
    .route("/report/:id")

    .patch(authorize(LOGGED_USER), controller.report);

module.exports = router;
