// NoteSpace application entry point
// Script order in index.html: api.js -> notes.js -> search.js -> app.js

(function () {
  "use strict";

  function initializeApp() {
    if (window.notes && typeof window.notes.loadNotes === "function") {
      window.notes.loadNotes();
    } else {
      console.error("NoteSpace notes module is not available.");
    }

    const sidebarToggle = document.getElementById("sidebar-toggle");
    sidebarToggle?.addEventListener("click", () => {
      document.body.classList.toggle("sb-closed");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
  } else {
    initializeApp();
  }
})();
