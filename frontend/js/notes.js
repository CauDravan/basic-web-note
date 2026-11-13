// NoteSpace note list
// This file uses classic scripts and the shared window.api object.

(function () {
  "use strict";

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function createNoteElement(note) {
    const card = document.createElement("article");
    card.className = "note-card";

    const icon = document.createElement("span");
    icon.className = "note-icon";
    icon.textContent = note.icon || "📄";

    const title = document.createElement("span");
    title.className = "note-title";
    title.textContent = note.title || "Untitled";

    const preview = document.createElement("span");
    preview.className = "note-preview";
    const content = typeof note.content === "string" ? note.content : "";
    preview.textContent = content.replace(/\s+/g, " ").trim().slice(0, 90);

    const meta = document.createElement("span");
    meta.className = "note-meta";
    meta.textContent = formatDate(note.updatedAt || note.updated_at || note.createdAt);

    card.append(icon, title, preview, meta);
    card.dataset.noteId = note._id || note.id || "";
    return card;
  }

  async function loadNotes() {
    const container = document.getElementById("notes-container");
    const count = document.getElementById("notes-count");
    const sidebar = document.getElementById("sidebar-notes");

    if (!container) return;

    container.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "empty-state";
    loading.textContent = "Loading notes...";
    container.appendChild(loading);

    try {
      if (!window.api || typeof window.api.getNotes !== "function") {
        throw new Error("NoteSpace API has not been initialized.");
      }

      const result = await window.api.getNotes();
      const notes = Array.isArray(result) ? result : (result?.notes || []);

      container.replaceChildren();
      if (sidebar) sidebar.replaceChildren();

      if (count) count.textContent = `${notes.length} notes`;

      if (notes.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No notes yet. Create your first note to get started.";
        container.appendChild(empty);
        return;
      }

      notes
        .filter((note) => !note.trashed)
        .forEach((note) => {
          container.appendChild(createNoteElement(note));

          if (sidebar) {
            const link = document.createElement("div");
            link.className = "sb-item";
            link.textContent = `${note.icon || "📄"} ${note.title || "Untitled"}`;
            link.dataset.noteId = note._id || note.id || "";
            sidebar.appendChild(link);
          }
        });

      if (window.lucide) window.lucide.createIcons();
    } catch (error) {
      console.error("Unable to load notes:", error);
      container.replaceChildren();
      const message = document.createElement("p");
      message.className = "empty-state";
      message.textContent = `Could not load notes: ${error.message}`;
      container.appendChild(message);
      if (count) count.textContent = "";
    }
  }

  window.notes = { loadNotes };
})();
