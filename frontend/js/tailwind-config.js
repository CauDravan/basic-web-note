// Loaded right after the Tailwind CDN script. Sets the saved theme early (no flash) and maps colors to CSS variables.
(function () {
  var theme = "light";
  try {
    theme = localStorage.getItem("notespace-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
})();

tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", side: "var(--side)", ink: "var(--ink)", mut: "var(--mut)", mut2: "var(--mut2)",
        line: "var(--line)", hov: "var(--hov)", act: "var(--act)", blue: "var(--blue)",
        danger: "var(--danger)", pop: "var(--pop)",
      },
    },
  },
};