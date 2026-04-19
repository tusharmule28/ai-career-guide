// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// Use placeholders or inject these during build if possible.
firebase.initializeApp({
  apiKey: "AIzaSyDcrhK0c5j4aqwid81P5VzeM5Om75li1Rw",
  authDomain: "job-ai-platform-c5816.firebaseapp.com",
  projectId: "job-ai-platform-c5816",
  storageBucket: "job-ai-platform-c5816.firebasestorage.app",
  messagingSenderId: "29672691392",
  appId: "1:29672691392:web:cce4dcd61f1ab8d9bebf25",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
