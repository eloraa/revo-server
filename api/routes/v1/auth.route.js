const express = require("express");
const controller = require("../../controllers/auth.controller");

const { user } = require("../../validations/auth.validation");
const { validate } = require("express-validation");

const router = express.Router();

router
    .route("/add-user")

    .post(validate(user), controller.add);

module.exports = router;
