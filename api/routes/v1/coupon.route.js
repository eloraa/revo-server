const express = require("express");
const controller = require("../../controllers/coupon.controller");
const { validate } = require("express-validation");
const { add } = require("../../validations/coupon.validation");
const { authorize, ADMIN } = require("../../middlewares/auth");

const router = express.Router();

router
    .route("/")

    .get(controller.list);

router
    .route("/")

    .post(authorize(ADMIN), validate(add), controller.add);

router
    .route("/:id")

    .patch(authorize(ADMIN), validate(add), controller.update);


router
    .route("/:id")

    .delete(authorize(ADMIN), controller.delete);

module.exports = router;
