"use client";
// Google Analytics 4 + Sentry. Chỉ chạy trên bản deploy, bỏ qua localhost.
import { useEffect } from "react";

const GA_ID = "G-X3LS332GYQ";
const SENTRY_LOADER = "https://js-de.sentry-cdn.com/d409b06c5788cfc3ac3eba968ad9f247.min.js";

function load(src, crossOrigin) {
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  if (crossOrigin) s.crossOrigin = crossOrigin;
  document.head.appendChild(s);
}

export default function Monitoring() {
  useEffect(() => {
    const isLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    // window.track("create_note"): an toàn khi GA chưa bật
    window.track = (name, params) => { if (!isLocal) gtag("event", name, params || {}); };
    if (isLocal) {
      console.info("[monitoring] GA và Sentry tắt khi chạy localhost.");
      return;
    }
    gtag("js", new Date());
    gtag("config", GA_ID);
    load("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID));
    load(SENTRY_LOADER, "anonymous");
  }, []);
  return null;
}
