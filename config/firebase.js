const admin = require("firebase-admin");
const { firebaseConfig } = require("./vars");

const serviceAccount = firebaseConfig

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

exports.setCustomClaims = async (claim, email, value) => {
    const user = await admin.auth().getUserByEmail(email);
    if (user.customClaims && user.customClaims[claim] === value) {
        return;
    }

    return admin.auth().setCustomUserClaims(user.uid, {
        subscribed: user.customClaims?.subscribed || claim === 'subscribed' ? value : null,
        admin: user.customClaims?.admin && claim !== 'moderator' || claim === 'admin' ? value : null,
        moderator: user.customClaims?.moderator && claim !== 'admin' || claim === 'moderator' ? value : null,
    });
};
