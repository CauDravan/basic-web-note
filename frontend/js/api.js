// NoteSpace API client
// Frontend: basic-web-note-frontend.vercel.app | Backend: basic-web-note-backend.vercel.app
// For local development change API_BASE to "http://localhost:5000/api".

const API_BASE = "https://basic-web-note-backend.vercel.app/api";

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
      throw new Error(json.message || `Request failed: ${response.status}`);
    }
    return json.data;
  } catch (error) {
    console.error("NoteSpace API Error:", error);
    throw error;
  }
}

window.api = {
  base: API_BASE,
  getNotes: () => request("/notes"),
  getNote: (id) => request(`/notes/${encodeURIComponent(id)}`),
  createNote: (body) => request("/notes", { method: "POST", body: JSON.stringify(body) }),
  // opts lets callers pass fetch options, e.g. { keepalive: true } when the page is closing
  updateNote: (id, body, opts = {}) =>
    request(`/notes/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body), ...opts }),
  deleteNote: (id) => request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
};