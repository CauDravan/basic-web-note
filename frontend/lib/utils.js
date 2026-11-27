export const noteId = (n) => n._id || n.id;
export const noteIcon = (n) => n.icon || "📄";
export const noteTitle = (n) => n.title || "Untitled";
export const byUpdated = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });
export function fmtDate(v) {
  const d = new Date(v);
  return v && !Number.isNaN(d.getTime()) ? dateFmt.format(d) : "";
}

// q: chuỗi tìm kiếm đã trim + lowercase
export function matches(n, q) {
  return !q || (noteTitle(n) + " " + (n.content || "") + " " + (n.tags || []).join(" ")).toLowerCase().includes(q);
}

export function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("notespace-theme", t); } catch (e) {}
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = t === "dark" ? "#191919" : "#ffffff";
}
