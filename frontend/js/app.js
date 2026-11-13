// NoteSpace application entry point
// Script order in index.html: api.js -> notes.js -> search.js -> app.js

(function () {
  "use strict";

  function initializeApp() {
    const newNoteButton = document.getElementById("new-note-btn");
    const sidebarToggle = document.getElementById("sidebar-toggle");

    if (window.notes && typeof window.notes.loadNotes === "function") {
      window.notes.loadNotes();
    } else {
      console.error("NoteSpace notes module is not available.");
    }

    newNoteButton?.addEventListener("click", () => {
      window.notes?.createNote(newNoteButton);
    });

    sidebarToggle?.addEventListener("click", () => {
      document.body.classList.toggle("sb-closed");
    });

    if (window.lucide) window.lucide.createIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
  } else {
    initializeApp();
  }
})();
