// Chạy sớm trong <head>: áp dụng theme đã lưu trước khi trang hiển thị (tránh nháy sáng/tối).
(function () {
  var theme = "light";
  try {
    theme = localStorage.getItem("notespace-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
})();