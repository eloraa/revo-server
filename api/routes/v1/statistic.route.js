const express = require("express");
const controller = require("../../controllers/statistic.controller");
const { authorize, ADMIN } = require("../../middlewares/auth");
const router = express.Router();

router
    .route("/")

    .get(authorize(ADMIN), controller.statistic);

module.exports = router;
