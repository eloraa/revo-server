const path = require("path");

// import .env variables
require("dotenv-safe").config({
    path: path.join(__dirname, "../.env"),
    sample: path.join(__dirname, "../.env.example"),
});

module.exports = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
    allowedHost: process.env.ALLOWED_HOST,
    roles: ["admin", "moderator", "normal"],
    mongo: {
        uri:
            process.env.NODE_ENV === "test"
                ? process.env.MONGO_URI_TESTS
                : process.env.MONGO_URI,
    },
    firebaseConfig: require("../admin.json"),
    stripeSecretKey: process.env.STRIPE_SECRET_APIKEY,
    logs: process.env.NODE_ENV === "production" ? "combined" : "dev",
    favicon:
        '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="9" viewBox="0 0 7 9" fill="none"> <style> path { fill: black; } @media (prefers-color-scheme: dark) { path { fill: white; } } </style> <path fill-rule="evenodd" clip-rule="evenodd" d="M0.599609 0.600098V9H1.7998V5.3999H3.61133L5.39941 7.2002V9H6.59961V6.94824C6.59961 6.9292 6.59082 6.89697 6.57422 6.85107C6.5625 6.81836 6.54688 6.77881 6.52734 6.73193C6.4873 6.62012 6.45605 6.55225 6.43164 6.52832L5.17188 5.26807C5.38184 5.18359 5.57129 5.08594 5.74023 4.9751C5.81934 4.92285 5.89355 4.86816 5.96387 4.81006C6.02734 4.75732 6.08789 4.70166 6.14355 4.64404C6.44727 4.31592 6.59961 3.96826 6.59961 3.6001V2.3999C6.59961 2.21094 6.56934 2.02979 6.50781 1.85645C6.47461 1.76318 6.43262 1.67236 6.38184 1.5835C6.2959 1.43311 6.18457 1.28955 6.04785 1.15234C5.67969 0.78418 5.26367 0.600098 4.7998 0.600098H0.599609Z" fill="black" /> </svg>',
};
