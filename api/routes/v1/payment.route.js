const express = require("express");
const controller = require("../../controllers/payment.controller");

const { validate } = require("express-validation");
const { authorize, LOGGED_USER } = require("../../middlewares/auth");
const { intent, add } = require("../../validations/payment.validation");

const router = express.Router();

router
    .route("/create-payment-intent")

    .post(validate(intent), authorize(LOGGED_USER), controller.intent);
router
    .route("/add")

    .post(validate(add), authorize(LOGGED_USER), controller.add);

module.exports = router;
