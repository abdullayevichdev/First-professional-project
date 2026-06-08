import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

try {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);
  getDocs(collection(db, "content"))
    .then(snap => {
      console.log(`TOTAL DOCUMENTS SEEDED: ${snap.size}`);
      snap.forEach(doc => {
        console.log(` - ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
      });
      process.exit(0);
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      process.exit(1);
    });
} catch (e: any) {
  console.error("Crash:", e.message);
  process.exit(1);
}
