// NoteSpace API Configuration
// Frontend: basic-web-note-frontend.vercel.app
// Backend: basic-web-note-backend.vercel.app

const API_BASE = "https://basic-web-note-backend.vercel.app/api";

// Reusable request handler
async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const text = await response.text();
    let json = {};

    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Invalid response from server");
    }

    if (!response.ok || json.success === false) {
      throw new Error(
        json.message || `Request failed: ${response.status}`
      );
    }

    return json.data;
  } catch (error) {
    console.error("NoteSpace API Error:", error);
    throw error;
  }
}

// Public API methods
window.api = {
  getNotes() {
    return request("/notes");
  },

  getNote(id) {
    return request(`/notes/${encodeURIComponent(id)}`);
  },

  createNote(body) {
    return request("/notes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateNote(id, body) {
    return request(`/notes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteNote(id) {
    return request(`/notes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

console.log("NoteSpace API initialized:", API_BASE);
