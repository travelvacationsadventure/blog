// One-time local utility. Never upload serviceAccountKey.json to your website.
const admin = require('firebase-admin');
const fs = require('fs');
const email = process.argv[2];
if (!email) { console.error('Usage: npm run make-admin -- you@example.com'); process.exit(1); }
if (!fs.existsSync('serviceAccountKey.json')) { console.error('Place serviceAccountKey.json in this folder first.'); process.exit(1); }
admin.initializeApp({credential: admin.credential.cert(require('./serviceAccountKey.json'))});
admin.auth().getUserByEmail(email)
  .then(user => admin.auth().setCustomUserClaims(user.uid, {admin:true}))
  .then(() => { console.log(`Admin access granted to ${email}. Sign out and back in.`); process.exit(0); })
  .catch(error => { console.error(error.message); process.exit(1); });

