const httpStatus = require("http-status");
const User = require("../models/user.model");
const APIError = require("../errors/api-error");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/vars");

const ADMIN = "admin";
const MOD = "moderator";
const NORMAL_USER = "normal";

const handleJWT = (req, res, next, roles) => async () => {
    const apiError = new APIError({
        message: "Unauthorized",
        status: httpStatus.UNAUTHORIZED,
    });


    try {
        const user = await User.get(req.body);
        if (user) {
            if (
                roles !== user.role ||
                !(await user.userMatches(req.auth.sub))
            ) {
                apiError.status = httpStatus.FORBIDDEN;
                apiError.message = "Forbidden";
                return next(apiError);
            }
        } else if (!roles.includes(user.role)) {
            apiError.status = httpStatus.FORBIDDEN;
            apiError.message = "Forbidden";
            return next(apiError);
        } else if (err || !user) {
            return next(apiError);
        }

        req.user = user;
        return next();
    } catch (e) {
        return next(apiError);
    }
};

const authenticate = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const token = req.headers.authorization.split(" ")[1];

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.auth = decoded;
        return next();
    } catch {
        return res.status(401).send({ message: "unauthorized access" });
    }
};

exports.ADMIN = ADMIN;
exports.MODERATOR = MOD;
exports.LOGGED_USER = NORMAL_USER;

exports.authorize =
    (roles = User.roles) =>
    (req, res, next) =>
        authenticate(req, res, handleJWT(req, res, next, roles));
