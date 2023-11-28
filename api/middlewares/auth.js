const httpStatus = require("http-status");
const User = require("../models/user.model");
const APIError = require("../errors/api-error");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/vars");
const Joi = require("joi");
const { has, keys, get, difference } = require("lodash");

const ADMIN = "admin";
const MOD = "moderator";
const NORMAL_USER = "normal";
const FORCE = "_FORCE";

const validateSchema = (req, schema) => {
    const schemaType = Object.keys(schema)[0];

    if (req[schemaType] && Object.keys(req[schemaType]).length > 0) {
        const schemaProperties = Object.keys(
            schema[schemaType].describe().keys
        );

        const isValid = schemaProperties.every((property) =>
            req[schemaType].hasOwnProperty(property)
        );

        if (isValid) return true;
        else return false;
    }

    return false;
};

const handleJWT = (req, res, next, roles, options) => async () => {
    const apiError = new APIError({
        message: "Unauthorized",
        status: httpStatus.UNAUTHORIZED,
    });

    if (roles === FORCE && !validateSchema(req, options?.schema)) return next();
    else roles = options?.roles || roles;

    try {
        const user = await User.get(
            req.body?.uid
                ? req.body
                : req.query.uid
                ? {
                      uid: req.query?.uid,
                      email: decodeURIComponent(req.query?.email),
                  }
                : { uid: req.body?.userUID, email: req.body?.userEmail }
        );

        if (user) {
            if (
                ((roles === NORMAL_USER &&
                    (user.role === NORMAL_USER ||
                        user.role === MOD ||
                        user.role === ADMIN)) ||
                    (roles === MOD &&
                        (user.role === MOD || user.role === ADMIN)) ||
                    (roles === ADMIN && user.role === ADMIN)) &&
                (await user.userMatches(req.auth.sub))
            ) {
                req.user = user;
                return next();
            } else if (!roles.includes(user.role)) {
                apiError.status = httpStatus.FORBIDDEN;
                apiError.message = "Forbidden";
                return next(apiError);
            } else {
                apiError.status = httpStatus.FORBIDDEN;
                apiError.message = "Forbidden";
                return next(apiError);
            }
        } else {
            apiError.status = httpStatus.FORBIDDEN;
            apiError.message = "Forbidden";
            return next(apiError);
        }
    } catch (e) {
        return next(apiError);
    }
};

const authenticate = (req, res, next, roles, options) => {
    if (roles === FORCE && validateSchema(req, options.schema))
        roles = options.roles;
    else if(options) return next();

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
exports.FORCED = FORCE;

exports.authorize =
    (roles = User.roles, obj) =>
    (req, res, next) =>
        authenticate(
            req,
            res,
            handleJWT(req, res, next, roles, obj),
            roles,
            obj
        );
