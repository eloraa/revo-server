const express = require("express");
const controller = require("../../controllers/newsletter.controller");
const { validate } = require("express-validation");
const { add } = require("../../validations/newsletter.validation");

const router = express.Router();

router
    .route("/")

    .post(validate(add), controller.add);

module.exports = router;
