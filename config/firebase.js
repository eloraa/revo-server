const admin = require("firebase-admin");
const { firebaseConfig } = require("./vars");

const serviceAccount = require(firebaseConfig);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

exports.setCustomClaims = async (claim, email, value) => {
    const user = await admin.auth().getUserByEmail(email);
    console.log(user.customClaims[claim], value, claim);
    if (user.customClaims[claim] === value) {
        return;
    }
    await admin.auth().setCustomUserClaims(user.uid, {});
    return admin.auth().setCustomUserClaims(user.uid, {
        admin: null,
    });
};
