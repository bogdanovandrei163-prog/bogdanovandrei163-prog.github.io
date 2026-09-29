const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

admin.initializeApp();

/**
 * Конфигурация через переменные окружения Firebase:
 * firebase functions:config:set pushengage.app_id="fc8cd838-60e7-4352-a5a8-ca4067577b25" pushengage.api_key="ВАШ_API_KEY"
 *
 * API-ключ берётся в дашборде PushEngage: Settings → API Keys.
 * НИКОГДА не кладите его в клиентский код.
 */
const PE_APP_ID = functions.config().pushengage?.app_id;
const PE_API_KEY = functions.config().pushengage?.api_key;

// Триггер на новое сообщение в чате
exports.sendPushOnNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const chatId = context.params.chatId;

    // Не отправляем push самому себе
    const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
    const chatData = chatDoc.data();
    const recipientId = chatData.participants.find(id => id !== message.sender);
    if (!recipientId) return null;

    // Проверяем, что получатель вообще подписан (по желанию)
    const userDoc = await admin.firestore().collection('users').doc(recipientId).get();
    if (!userDoc.exists) return null;

    // Формируем payload. chatId передаём через URL, чтобы при клике
    // PWA открылась и сразу перешла в нужный чат.
    const title = message.senderName || 'Новое сообщение';
    const body = message.type === 'text'
      ? (message.text || '').substring(0, 120)
      : '📎 Медиа';

    const url = `https://ВАШ_ДОМЕН/?chatId=${chatId}`;

    const payload = {
      notification: {
        title: title,
        message: body,
        url: url,
        icon: 'https://ВАШ_ДОМЕН/icon-192.png'
      },
      // Таргетинг по custom identifier (тот, что мы установили через SDK)
      send_to: {
        custom_identifier: [recipientId]
      }
    };

    try {
      const response = await fetch('https://api.pushengage.com/apiv1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': PE_API_KEY
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log('PushEngage response:', result);
    } catch (err) {
      console.error('Ошибка отправки push через PushEngage:', err);
    }

    return null;
  });
