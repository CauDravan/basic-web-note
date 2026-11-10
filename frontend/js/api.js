// Tự chọn URL: chạy local thì dùng localhost, lên mạng thì dùng Vercel
const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://TEN-PROJECT-BACKEND.vercel.app/api";   // <-- đổi thành URL của bạn

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data;   // chỉ trả phần data cho gọn
}

export const api = {
  getNotes:   ()          => request("/notes"),
  getNote:    (id)        => request(`/notes/${id}`),
  createNote: (body)      => request("/notes", { method: "POST", body: JSON.stringify(body) }),
  updateNote: (id, body)  => request(`/notes/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteNote: (id)        => request(`/notes/${id}`, { method: "DELETE" }),
};