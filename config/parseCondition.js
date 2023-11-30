const APIError = require("../api/errors/api-error");

const operators = ["!=", "=", ">", "<", ">=", "<=", "||", "&&"];

const conditionMatch = (input) => {
    if (typeof input !== "string") {
        return null;
    }
    // Check for "or" condition
    const orMatch = input.match(/^(.*?)\s*\|\|/);
    if (orMatch) {
        const leftCondition = orMatch[1].trim();
        const rightCondition = input.substring(orMatch[0].length).trim();
        return {
            operator: "||",
            left: conditionMatch(leftCondition),
            right: conditionMatch(rightCondition),
        };
    }

    // Check for "and" condition
    const andMatch = input.match(/^(.*?)\s*&&/);
    if (andMatch) {
        const leftCondition = andMatch[1].trim();
        const rightCondition = input.substring(andMatch[0].length).trim();
        return {
            operator: "&&",
            left: conditionMatch(leftCondition),
            right: conditionMatch(rightCondition),
        };
    }

    let matchedOperator = null;

    for (const operator of operators) {
        const index = input.indexOf(operator);
        if (index !== -1) {
            if (!matchedOperator || matchedOperator.length < operator.length) {
                matchedOperator = operator;
            }
        }
    }

    if (matchedOperator) {
        const suffix = input.substring(
            input.indexOf(matchedOperator) + matchedOperator.length
        );

        const valueMatch = suffix.match(/^\[([^\]]+)\]/);
        if (valueMatch) {
            return { operator: matchedOperator, value: valueMatch[1] };
        } else {
            return { operator: matchedOperator, value: suffix.trim() };
        }
    }

    return null;
};

exports.parseCondition = (condition) => {
    const parseSingleCondition = (condition) => {
        const match =
            typeof condition === "object"
                ? condition
                : conditionMatch(condition);

        if (!match) {
            throw new APIError({
                message: `Invalid logic condition: ${condition}`,
            });
        }

        const { operator, value, left, right } = match;

        switch (operator) {
            case "||":
                return {
                    $or: [
                        parseSingleCondition(left),
                        parseSingleCondition(right),
                    ],
                };
            case "&&":
                return {
                    $and: [
                        parseSingleCondition(left),
                        parseSingleCondition(right),
                    ],
                };
            case ">":
                return {
                    $gt: parseValue(value),
                };
            case ">=":
                return {
                    $gte: parseValue(value),
                };
            case "<":
                return {
                    $lt: parseValue(value),
                };
            case "<=":
                return {
                    $lte: parseValue(value),
                };
            case "=":
                return {
                    $eq: parseValue(value),
                };
            case "!=":
                return {
                    $ne: parseValue(value),
                };
            default:
                throw new APIError({
                    message: `Unsupported operator: ${operator}`,
                });
        }
    };

    const parseValue = (rawValue) => {
        const numericValue = Number(rawValue);

        if (!isNaN(numericValue)) {
            return numericValue;
        } else {
            return rawValue;
        }
    };

    return parseSingleCondition(condition);
};

exports.conditionMatch = conditionMatch;
