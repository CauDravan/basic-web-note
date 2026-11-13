// Settings page: theme switch + API connection test.
(function () {
  "use strict";
  if (document.body.dataset.page !== "settings" || !window.NS) return;

  const buttons = document.querySelectorAll("[data-theme-opt]");
  const mark = () => buttons.forEach((b) => {
    const on = b.dataset.themeOpt === document.documentElement.dataset.theme;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  buttons.forEach((b) => b.addEventListener("click", () => {
    NS.setTheme(b.dataset.themeOpt);
    mark();
    NS.toast(`Theme set to ${b.dataset.themeOpt}.`);
  }));
  mark();

  const apiUrl = document.getElementById("api-url");
  if (apiUrl) apiUrl.textContent = window.api.base;

  const test = document.getElementById("test-api");
  if (test) test.addEventListener("click", async () => {
    test.disabled = true;
    const t0 = performance.now();
    try {
      const notes = await window.api.getNotes();
      NS.toast(`Connected: ${notes.length} notes, ${Math.round(performance.now() - t0)} ms.`);
    } catch (e) {
      NS.toast("Connection failed: " + e.message);
    } finally {
      test.disabled = false;
    }
  });
})();