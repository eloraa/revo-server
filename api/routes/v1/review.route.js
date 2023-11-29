const express = require("express");
const controller = require("../../controllers/review.controller");
const { validate } = require("express-validation");
const { review } = require("../../validations/review.validation");

const router = express.Router();

router
    .route("/")

    .post(validate(review), controller.add);

module.exports = router;
