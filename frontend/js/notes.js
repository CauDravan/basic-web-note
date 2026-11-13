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

      const activeNotes = notes.filter((note) => !note.trashed);
      if (count) count.textContent = `${activeNotes.length} notes`;

      if (activeNotes.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No notes yet. Create your first note to get started.";
        container.appendChild(empty);
        return true;
      }

      activeNotes.forEach((note) => {
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
      return true;
    } catch (error) {
      console.error("Unable to load notes:", error);
      container.replaceChildren();
      const message = document.createElement("p");
      message.className = "empty-state";
      message.textContent = `Could not load notes: ${error.message}`;
      container.appendChild(message);
      if (count) count.textContent = "";
      return false;
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }

  async function createNote(button) {
    if (!window.api || typeof window.api.createNote !== "function") {
      showToast("The notes service is not available. Please reload the page.");
      return null;
    }

    if (button?.disabled) return null;

    if (button) {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    }

    try {
      const createdNote = await window.api.createNote({
        title: "Untitled",
        content: "",
        parent_id: null,
        pinned: false,
        icon: "📄",
        color: "white",
        category: "NOTE",
        tags: [],
      });

      if (!createdNote || !(createdNote._id || createdNote.id)) {
        throw new Error("The server did not return the created note.");
      }

      const refreshed = await loadNotes();
      showToast(
        refreshed
          ? "New note created successfully."
          : "Note created, but the list could not refresh. Reload the page."
      );
      return createdNote;
    } catch (error) {
      console.error("Unable to create note:", error);
      showToast(`Could not create note: ${error.message}`);
      return null;
    } finally {
      if (button) {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    }
  }

  window.notes = { loadNotes, createNote };
})();
