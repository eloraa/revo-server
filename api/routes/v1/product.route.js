const express = require("express");
const controller = require("../../controllers/product.controller");

const { authorize, LOGGED_USER } = require("../../middlewares/auth");
const { validate } = require("express-validation");
const { product } = require("../../validations/product.validation");

const router = express.Router();
router
    .route("/add")

    .post(authorize(LOGGED_USER), validate(product), controller.add);

module.exports = router;
