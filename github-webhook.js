export default async function handler(req, res) {
  // Проверяем, что запрос пришел методом POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Получаем данные от GitHub (кто пушнул, в какую ветку и т.д.)
  const githubData = req.body;
  const repoName = githubData.repository?.name || 'вашем репозитории';
  const branch = githubData.ref?.replace('refs/heads/', '') || 'main';
  const pusher = githubData.pusher?.name || 'Разработчик';

  // Формируем текст уведомления
  const notificationTitle = `?? Обновление кода!`;
  const notificationBody = `${pusher} сделал пуш в ветку [${branch}] проекта ${repoName}.`;

  // Данные для OneSignal (ключи возьмем из переменных окружения Vercel ради безопасности)
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  try {
    const response = await fetch('https://onesignal.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['All Users'], // Отправляем ВСЕМ подписчикам
        contents: { en: notificationBody, ru: notificationBody },
        headings: { en: notificationTitle, ru: notificationTitle },
        url: githubData.repository?.html_url || 'https://onesignal.com' // При клике откроется GitHub (можно поменять на ваш сайт)
      })
    });

    const result = await response.json();
    return res.status(200).json({ success: true, onesignal: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
