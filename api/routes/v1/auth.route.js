const express = require("express");
const controller = require("../../controllers/auth.controller");

const { user } = require("../../validations/auth.validation");
const { validate } = require("express-validation");
const { authorize, LOGGED_USER } = require("../../middlewares/auth");

const router = express.Router();

router
    .route("/signin")

    .post(validate(user), controller.sign);

router
    .route("/add-user")

    .post(validate(user), controller.add);

router
    .route("/update-user")

    .post(validate(user), authorize(LOGGED_USER), controller.update);

module.exports = router;
