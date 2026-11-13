// Sidebar search: filters the sidebar list and the list on the current page (Home/Pinned/Trash).
(function () {
  "use strict";
  const input = document.getElementById("search-input");
  if (!input || !window.NS) return;
  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      NS.query = input.value.trim().toLowerCase();
      NS.changed();
      NS.icons();
    }, 120);
  });
})();