/* eslint-env serviceworker */

/**
 * عامل الخدمة.
 *
 * ثلاث استراتيجيات بحسب نوع الطلب:
 *   1. التنقّل (فتح صفحة) → الشبكة أولًا، ثم النسخة المخزَّنة عند الانقطاع.
 *   2. أصول البناء (JS/CSS/خطوط/صور) → المخزَّن أولًا؛ فهي تحمل بصمة
 *      محتوى في اسمها فلا تتغيّر إلا بإصدار جديد.
 *   3. طلبات الـ API → الشبكة فقط. لا تُخزَّن إطلاقًا: الإعلانات
 *      وطلبات التواصل تتغيّر حالتها بموافقة الإدارة، وعرض نسخة قديمة
 *      منها يضلّل المستخدم في خدمة حسّاسة كهذه.
 */

const VERSION = 'v1';
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;

/** الحد الأدنى لتشغيل التطبيق دون اتصال */
const SHELL_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      // فشل تخزين أصل واحد يجب ألا يمنع تنصيب العامل
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isApiRequest = (url) => url.pathname.startsWith('/api/');

const isBuildAsset = (url) =>
  url.pathname.startsWith('/_expo/') ||
  /\.(js|css|woff2?|ttf|otf|png|jpe?g|svg|webp|ico)$/i.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // التخزين يخص GET فقط؛ أي تعديل يجب أن يصل الخادم فعليًا
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // نطاق آخر (الـ API غالبًا) — نتركه للشبكة بلا اعتراض
  if (url.origin !== self.location.origin) return;

  if (isApiRequest(url)) return;

  if (isBuildAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
  }
});

/**
 * إشعارات الدفع.
 *
 * الخادم لا يرسل إشعارات دفع بعد (Firebase غير موصول)، لكن المستمع جاهز
 * حتى لا يتطلب تفعيلها لاحقًا تعديلًا على عامل الخدمة وإصدارًا جديدًا.
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'مستمسكاتي', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'مستمسكاتي', {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      data: { url: payload.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // إعادة استخدام نافذة مفتوحة إن وُجدت بدل فتح أخرى
      for (const client of clientList) {
        if (client.url.includes(target) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
