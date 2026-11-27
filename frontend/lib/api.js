// NoteSpace API client. Đổi backend bằng biến môi trường NEXT_PUBLIC_API_BASE.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://basic-web-note-backend.vercel.app/api";

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

export const api = {
  base: API_BASE,
  getNotes: () => request("/notes"),
  getNote: (id) => request(`/notes/${encodeURIComponent(id)}`),
  createNote: (body) => request("/notes", { method: "POST", body: JSON.stringify(body) }),
  // opts: tuỳ chọn fetch, ví dụ { keepalive: true } khi trang đang đóng
  updateNote: (id, body, opts = {}) =>
    request(`/notes/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body), ...opts }),
  // action: "summarize" | "improve" | "title"; trả về { action, result }
  ai: (action, text) => request("/ai", { method: "POST", body: JSON.stringify({ action, text }) }),
  deleteNote: (id) => request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
