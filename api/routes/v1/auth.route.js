const express = require("express");
const controller = require("../../controllers/auth.controller");

const { user, claims } = require("../../validations/auth.validation");
const { validate } = require("express-validation");
const { authorize, LOGGED_USER, ADMIN } = require("../../middlewares/auth");

const router = express.Router();
router
    .route("/users")

    .get(authorize(ADMIN), controller.list);

router
    .route("/signin")

    .post(validate(user), controller.sign);

router
    .route("/add-user")

    .post(validate(user), controller.add);

router
    .route("/update-user")

    .patch(validate(user), authorize(LOGGED_USER), controller.update);

router
    .route("/claims")

    .patch(validate(claims), authorize(ADMIN), controller.claims);

module.exports = router;
