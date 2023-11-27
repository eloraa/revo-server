const admin = require("firebase-admin");
const { firebaseConfig } = require("./vars");

const serviceAccount = firebaseConfig;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

exports.setCustomClaims = async (claim, email, value) => {
    const user = await admin.auth().getUserByEmail(email);
    if (user.customClaims && user.customClaims[claim] === value) {
        return;
    }

    return admin.auth().setCustomUserClaims(user.uid, {
        subscribed:
            claim === "subscribed"
                ? value
                : user.customClaims?.subscribed || null,
        admin:
            claim === "admin"
                ? value
                : claim === "normal"
                ? null
                : claim !== "moderator"
                ? user.customClaims?.admin || null
                : null,
        moderator:
            claim === "moderator"
                ? value
                : claim === "normal"
                ? null
                : claim !== "admin"
                ? user.customClaims?.moderator || null
                : null,
    });
};
