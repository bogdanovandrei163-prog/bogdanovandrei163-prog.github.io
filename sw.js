<!DOCTYPE html>n
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Slip</title>
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Slip">
  <link rel="apple-touch-icon" href="icon.png">
  <link rel="manifest" href="manifest.json">

  <!-- OneSignal Web Push -->
  <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
  <script>
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: "3d8cbc58-4d49-412c-8318-57ecb1baef4a",
        safari_web_id: "web.onesignal.auto.09714a24-a3bb-414f-8109-d75a4f07e6fa",
        notifyButton: {
          enable: true,
        },
        // ↓↓↓ Указываем свой воркер и scope для поддиректории /slip/
        path: "/slip/OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/slip/" }
      });
    });
  </script>

  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
  <style>
    /* весь твой CSS без изменений */
  </style>
</head>
<body>
  <!-- весь твой HTML без изменений -->

  <!-- Баннер для iOS PWA -->
  <div id="pwaInstallBanner" style="display:none; position:fixed; bottom:0; left:0; right:0; background:#f2f2f7; padding:16px; text-align:center; border-top:1px solid #ccc; z-index:5000;">
    <p style="margin-bottom:8px; color:#1c1c1e;">Установите приложение, чтобы получать уведомления</p>
    <button id="pwaInstallBtn" class="ios-btn" style="width:auto; display:inline-block; padding:10px 24px;">Установить</button>
  </div>

  <script>
    // весь твой JavaScript без изменений (до самого конца)

    // --- В конце скрипта замени регистрацию sw.js ---
    // Было:
    // if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    // Стало:
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/slip/sw.js', { scope: '/slip/' }).catch(() => {});
    }

    // --- Баннер установки PWA для iOS ---
    (function() {
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      const isStandalone = 'standalone' in navigator && navigator.standalone;
      if (isIOS && !isStandalone) {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
          banner.style.display = 'block';
          document.getElementById('pwaInstallBtn').addEventListener('click', function() {
            alert('Нажмите кнопку «Поделиться» (квадрат со стрелкой) и выберите «На экран «Домой»»');
          });
        }
      }
    })();
  </script>
</body>
</html>
