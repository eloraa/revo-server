const express = require("express");
const router = express.Router();
const authroute = require("./auth.route");
const paymentroute = require("./payment.route");

/**
 * GET v1/status
 */
router.get("/status", (req, res) => res.send("OK"));

/**
 * Auth Routes
 */
router.use("/auth", authroute);
/**
 * Payment Routes
 */
router.use("/payment", paymentroute);

module.exports = router;
