// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./deskgoo-track-firebase-adminsdk-fbsvc-8a35faf080.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;