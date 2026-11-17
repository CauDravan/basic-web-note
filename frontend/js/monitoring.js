// Theo dõi người dùng (Google Analytics 4) và ghi log lỗi (Sentry).
// Điền 2 giá trị bên dưới (xem README). Chỉ chạy trên bản deploy, bỏ qua localhost.
(function () {
  "use strict";

  const GA_ID = "G-X3LS332GYQ";                                  // Measurement ID của GA4
  const SENTRY_LOADER = "https://js-de.sentry-cdn.com/d409b06c5788cfc3ac3eba968ad9f247.min.js"; // Loader Script của Sentry

  const isLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
  const gaOn = !GA_ID.includes("XXXX") && !isLocal;
  const sentryOn = !SENTRY_LOADER.includes("XXXX") && !isLocal;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); } // GA yêu cầu dùng "arguments"

  // Gửi sự kiện tùy chỉnh, ví dụ window.track("create_note"). An toàn khi GA chưa bật.
  window.track = function (name, params) {
    if (gaOn) gtag("event", name, params || {});
  };

  function load(src, crossOrigin) {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    if (crossOrigin) s.crossOrigin = crossOrigin;
    document.head.appendChild(s);
  }

  function start() {
    if (!gaOn) console.info("[monitoring] Google Analytics tắt (chưa điền GA_ID hoặc đang chạy localhost).");
    if (!sentryOn) console.info("[monitoring] Sentry tắt (chưa điền SENTRY_LOADER hoặc đang chạy localhost).");
    if (gaOn) {
      gtag("js", new Date());
      gtag("config", GA_ID);
      load("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID));
    }
    if (sentryOn) load(SENTRY_LOADER, "anonymous");
  }

  // Tải sau khi trang đã hiển thị để không ảnh hưởng điểm Lighthouse
  addEventListener("load", () => setTimeout(start, 0));
})();