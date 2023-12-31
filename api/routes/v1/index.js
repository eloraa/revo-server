const express = require("express");
const router = express.Router();
const authroute = require("./auth.route");
const paymentroute = require("./payment.route");
const productroute = require("./product.route");
const couponroute = require("./coupon.route");
const newsletterroute = require("./newsletter.route");
const reviewroute = require("./review.route");
const statisticroute = require("./statistic.route");

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

/**
 * Product Routes
 */
router.use("/product", productroute);

/**
 * Coupon Routes
 */
router.use("/coupons", couponroute);

/**
 * Review Routes
 */
router.use("/review", reviewroute);

/**
 * Newsletter Routes
 */
router.use("/newsletter", newsletterroute);

/**
 * Statistics Routes
 */
router.use("/statistics", statisticroute);

module.exports = router;
