const path = require('path');

// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../.env'),
  sample: path.join(__dirname, '../.env.example'),
});



module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  allowedHost: process.env.ALLOWED_HOST,
  roles: ['admin', 'moderator', 'normal'],
  mongo: {
    uri: process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI,
  },
  firebaseConfig: require('../admin.json'),
  stripeSecretKey: process.env.STRIPE_SECRET_APIKEY,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  favicon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none"> <style> path { fill: black; } @media (prefers-color-scheme: dark) { path { fill: white; } } </style> <path d="M20.9785 10.7656C20.9785 16.2885 16.5014 20.7656 10.9785 20.7656C5.45567 20.7656 0.978516 16.2885 0.978516 10.7656C0.978516 5.24278 5.45567 0.765625 10.9785 0.765625C16.5014 0.765625 20.9785 5.24278 20.9785 10.7656Z" fill="#0016EC" /> </svg>'
};
