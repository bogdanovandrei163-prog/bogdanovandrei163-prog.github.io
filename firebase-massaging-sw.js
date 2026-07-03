importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBRR33qbJhlWVjSykp2YLrk1dz8EWXiyI8",
  authDomain: "slip-54122.firebaseapp.com",
  projectId: "slip-54122",
  storageBucket: "slip-54122.firebasestorage.app",
  messagingSenderId: "92738326423",
  appId: "1:92738326423:web:4dd8a6de2655edbc37fed2",
  measurementId: "G-BK4H81MG2Z"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Фоновое получение уведомлений
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Новое сообщение';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});