const express = require("express");
const controller = require("../../controllers/product.controller");

const { authorize, LOGGED_USER } = require("../../middlewares/auth");
const { validate } = require("express-validation");
const { product } = require("../../validations/product.validation");
const { get } = require("../../validations/auth.validation");

const router = express.Router();

router
    .route("/get")

    .get(validate(get), authorize(LOGGED_USER), controller.get);

router
    .route("/add")

    .post(validate(product), authorize(LOGGED_USER), controller.add);

module.exports = router;
