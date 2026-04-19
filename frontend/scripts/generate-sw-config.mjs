import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = `
// Generated Firebase Messaging Configuration
// DO NOT COMMIT THIS FILE TO VERSION CONTROL
self.firebaseConfig = {
  apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}"
};
`;

const outputPath = path.resolve(process.cwd(), 'public', 'firebase-messaging-config.js');

try {
  fs.writeFileSync(outputPath, config);
  console.log('✅ Generated public/firebase-messaging-config.js from environment variables.');
} catch (err) {
  console.error('❌ Failed to generate firebase-messaging-config.js:', err);
  process.exit(1);
}
