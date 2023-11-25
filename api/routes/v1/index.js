const express = require("express");
const router = express.Router();
const authroute = require("./auth.route");

/**
 * GET v1/status
 */
router.get("/status", (req, res) => res.send("OK"));

/**
 * Auth Routes
 */
router.use("/auth", authroute);

module.exports = router;
