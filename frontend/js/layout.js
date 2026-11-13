// NoteSpace shared shell: sidebar, top bar, notes store (window.NS), toast, confirm dialog, popup menu, theme.
(function () {
  "use strict";

  const body = document.body;
  const base = body.dataset.base || "";
  const page = body.dataset.page || "";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byUpdated = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);
  const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

  const NS = (window.NS = {
    notes: [],
    query: "",
    ready: false,
    error: null,
    base,
    page,
    esc,
    url: {
      home: base + "index.html",
      pinned: base + "pages/pinned.html",
      trash: base + "pages/trash.html",
      settings: base + "pages/settings.html",
      note: (id) => base + "pages/note.html?id=" + encodeURIComponent(id),
    },
    id: (n) => n._id || n.id,
    find: (id) => NS.notes.find((n) => NS.id(n) === id),
    icon: (n) => n.icon || "📄",
    title: (n) => n.title || "Untitled",
    icons: () => window.lucide && window.lucide.createIcons(),
    fmtDate(v) {
      const d = new Date(v);
      return v && !Number.isNaN(d.getTime()) ? dateFmt.format(d) : "";
    },
    matches(n) {
      const q = NS.query;
      return !q || (NS.title(n) + " " + (n.content || "") + " " + (n.tags || []).join(" ")).toLowerCase().includes(q);
    },

    /* ---------- data ---------- */
    async load() {
      try {
        const r = await window.api.getNotes();
        NS.notes = Array.isArray(r) ? r : [];
        NS.ready = true;
        NS.error = null;
      } catch (e) {
        NS.error = e.message || "Unknown error";
      }
      NS.changed();
    },
    changed() {
      renderSidebar();
      document.dispatchEvent(new CustomEvent("ns:notes"));
    },
    upsert(note) {
      const i = NS.notes.findIndex((n) => NS.id(n) === NS.id(note));
      if (i >= 0) NS.notes[i] = note;
      else NS.notes.unshift(note);
      NS.changed();
    },
    remove(id) {
      NS.notes = NS.notes.filter((n) => NS.id(n) !== id);
      NS.changed();
    },
    async update(n, patch, opts) {
      try {
        const u = await window.api.updateNote(NS.id(n), patch, opts);
        NS.upsert(u);
        return u;
      } catch (e) {
        NS.toast("Could not save: " + e.message);
        return null;
      }
    },
    async destroy(n) {
      try {
        await window.api.deleteNote(NS.id(n));
        NS.remove(NS.id(n));
        return true;
      } catch (e) {
        NS.toast("Could not delete: " + e.message);
        return false;
      }
    },
    async createNote(btn) {
      if (btn) btn.disabled = true;
      try {
        const n = await window.api.createNote({
          title: "Untitled", content: "", parent_id: null, pinned: false,
          icon: "📄", color: "white", category: "NOTE", tags: [],
        });
        location.href = NS.url.note(NS.id(n));
      } catch (e) {
        NS.toast("Could not create note: " + e.message);
        if (btn) btn.disabled = false;
      }
    },
    confirmDelete(n) {
      return NS.confirm({
        title: "Delete permanently?",
        text: `“${NS.title(n)}” will be removed forever. This can’t be undone.`,
        ok: "Delete",
      });
    },

    /* ---------- UI helpers ---------- */
    toast(msg) {
      let t = $("#toast");
      if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        t.setAttribute("role", "status");
        t.setAttribute("aria-live", "polite");
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.hidden = false;
      clearTimeout(NS._tt);
      NS._tt = setTimeout(() => (t.hidden = true), 3500);
    },
    flash(msg) {
      try { sessionStorage.setItem("ns-flash", msg); } catch (e) {}
    },
    setStatus(text) {
      const s = $("#status");
      if (s) s.textContent = text || "";
    },
    setCrumb(icon, text) {
      $("#crumb").innerHTML = `<span>${esc(icon)}</span><span class="truncate font-medium">${esc(text)}</span>`;
    },
    setTheme(t) {
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem("notespace-theme", t); } catch (e) {}
      const m = $('meta[name="theme-color"]');
      if (m) m.content = t === "dark" ? "#191919" : "#ffffff";
    },
    confirm({ title, text, ok = "Confirm" }) {
      return new Promise((resolve) => {
        const prev = document.activeElement;
        const ov = document.createElement("div");
        ov.className = "fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4";
        ov.innerHTML = `<div role="alertdialog" aria-modal="true" aria-labelledby="cf-h" class="w-full max-w-[420px] rounded-xl border border-line bg-bg p-5 shadow-2xl">
          <h2 id="cf-h" class="mb-2 text-lg font-semibold">${esc(title)}</h2>
          <p class="mb-4 text-mut2">${esc(text)}</p>
          <div class="flex justify-end gap-2"><button type="button" class="btn" data-r="0">Cancel</button><button type="button" class="btn btn-danger" data-r="1">${esc(ok)}</button></div></div>`;
        const done = (v) => {
          document.removeEventListener("keydown", onKey, true);
          ov.remove();
          if (prev && prev.focus) prev.focus();
          resolve(v);
        };
        const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); done(false); } };
        ov.addEventListener("click", (e) => {
          if (e.target === ov) done(false);
          const b = e.target.closest("[data-r]");
          if (b) done(b.dataset.r === "1");
        });
        document.addEventListener("keydown", onKey, true);
        document.body.appendChild(ov);
        $('[data-r="0"]', ov).focus();
      });
    },
    menu(anchor, items, cls = "") {
      closeMenu();
      const p = document.createElement("div");
      p.id = "ns-pop";
      p.setAttribute("role", "menu");
      p.className = "fixed z-50 max-h-80 overflow-auto rounded-lg border border-line bg-pop p-1 shadow-xl " +
        (cls === "emo" ? "emo grid grid-cols-6" : "min-w-[200px]");
      items.forEach((it) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "menuitem");
        b.className = "pop-item" + (it.danger ? " danger" : "");
        b.innerHTML = it.html || esc(it.label);
        if (it.aria) b.setAttribute("aria-label", it.aria);
        b.addEventListener("click", () => { closeMenu(); it.fn(); });
        p.appendChild(b);
      });
      document.body.appendChild(p);
      const r = anchor.getBoundingClientRect();
      p.style.left = Math.max(8, Math.min(r.left, innerWidth - p.offsetWidth - 8)) + "px";
      p.style.top = Math.max(8, Math.min(r.bottom + 4, innerHeight - p.offsetHeight - 8)) + "px";
      p.firstElementChild && p.firstElementChild.focus();
      setTimeout(() => {
        document.addEventListener("mousedown", outside);
        document.addEventListener("keydown", escClose);
      });
    },
  });

  function closeMenu() {
    const p = $("#ns-pop");
    if (p) p.remove();
    document.removeEventListener("mousedown", outside);
    document.removeEventListener("keydown", escClose);
  }
  function outside(e) { if (!e.target.closest("#ns-pop")) closeMenu(); }
  function escClose(e) { if (e.key === "Escape") closeMenu(); }

  /* Row used by Home / Pinned / Trash lists */
  NS.noteRow = function (n, { trash = false } = {}) {
    const row = document.createElement("article");
    row.className = "note-row flex cursor-pointer items-center gap-2.5 border-b border-line px-2.5 py-2 hover:bg-hov";
    row.tabIndex = 0;
    row.dataset.id = NS.id(n);
    const preview = (n.content || "").replace(/\s+/g, " ").trim().slice(0, 90);
    const btn = (a, label, icon, extra = "") =>
      `<button type="button" class="icon-btn ${extra}" data-a="${a}" aria-label="${label}" title="${label}"><i data-lucide="${icon}"></i></button>`;
    const actions = trash
      ? btn("restore", "Restore", "undo-2") + btn("delete", "Delete permanently", "trash-2", "btn-ghost-danger")
      : btn("pin", n.pinned ? "Remove from favorites" : "Add to favorites", "star") +
        btn("trash", "Move to Trash", "trash-2");
    row.innerHTML =
      `<span class="w-5 flex-none text-center">${esc(NS.icon(n))}</span>` +
      `<span class="min-w-0 flex-1 truncate font-medium">${esc(NS.title(n))}</span>` +
      `<span class="hidden min-w-0 max-w-[40%] truncate text-[13px] text-mut2 md:block">${esc(preview)}</span>` +
      `<span class="whitespace-nowrap text-xs text-mut">${esc(NS.fmtDate(n.updatedAt))}</span>` +
      `<span class="row-actions flex gap-0.5">${actions}</span>`;
    if (n.pinned && !trash) row.querySelector('[data-a="pin"] i').className = "text-[#E8B02E] fill-[#E8B02E]";
    return row;
  };

  /* ---------- shell ---------- */
  const navItem = (key, href, icon, label) =>
    `<a class="sb-item${page === key ? " active" : ""}" href="${href}"${page === key ? ' aria-current="page"' : ""}><i data-lucide="${icon}"></i><span>${label}</span></a>`;

  const sbRoot = $("#sidebar-root");
  if (sbRoot) {
    sbRoot.innerHTML = `
      <aside class="sidebar fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-line bg-side p-1.5" aria-label="Sidebar">
        <div class="flex items-center gap-2 p-2 font-semibold">
          <span class="grid h-[22px] w-[22px] place-items-center rounded-[5px] bg-ink text-xs font-bold text-bg">N</span>NoteSpace
        </div>
        <label class="sb-item" for="search-input"><i data-lucide="search"></i>
          <input id="search-input" type="search" placeholder="Search" autocomplete="off" aria-label="Search notes"></label>
        <nav class="mt-1 grid gap-0.5" aria-label="Main">
          ${navItem("home", NS.url.home, "house", "Home")}
          ${navItem("pinned", NS.url.pinned, "star", "Pinned")}
          ${navItem("trash", NS.url.trash, "trash-2", "Trash")}
        </nav>
        <div class="my-1.5 flex-1 overflow-auto"><div id="sb-fav"></div><div id="sb-pages"></div></div>
        <button id="new-note-btn" class="sb-item" type="button" data-new-note><i data-lucide="square-pen"></i><span>New note</span></button>
        ${navItem("settings", NS.url.settings, "settings", "Settings")}
      </aside>
      <div id="backdrop" class="fixed inset-0 z-20 bg-black/30" aria-hidden="true"></div>`;
  }

  const tbRoot = $("#topbar-root");
  if (tbRoot) {
    tbRoot.innerHTML = `
      <header class="sticky top-0 z-10 flex h-[45px] items-center gap-2 bg-bg px-2.5">
        <button id="sidebar-toggle" class="icon-btn" type="button" aria-label="Toggle sidebar" aria-expanded="true"><i data-lucide="panel-left"></i></button>
        <div id="crumb" class="flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap"></div>
        <span id="status" class="hidden text-xs text-mut sm:inline" aria-live="polite"></span>
        <div id="top-actions" class="flex items-center gap-0.5"></div>
      </header>`;
    NS.setCrumb(body.dataset.icon || "", body.dataset.title || "NoteSpace");
  }

  function renderSidebar() {
    const fav = $("#sb-fav"), pages = $("#sb-pages");
    if (!fav || !pages) return;
    const cur = new URLSearchParams(location.search).get("id");
    const link = (n) => {
      const active = page === "note" && cur === NS.id(n);
      return `<a class="sb-item${active ? " active" : ""}" href="${esc(NS.url.note(NS.id(n)))}"${active ? ' aria-current="page"' : ""}>
        <span class="w-5 flex-none text-center">${esc(NS.icon(n))}</span><span class="min-w-0 truncate">${esc(NS.title(n))}</span></a>`;
    };
    const live = NS.notes.filter((n) => !n.trashed && NS.matches(n)).sort(byUpdated);
    const favs = live.filter((n) => n.pinned);
    fav.innerHTML = favs.length ? `<div class="sec">Favorites</div>` + favs.map(link).join("") : "";
    const empty = NS.error ? "Could not load notes" : !NS.ready ? "Loading…" : NS.query ? "No results" : "No pages yet";
    pages.innerHTML = `<div class="sec">Pages</div>` + (live.length ? live.map(link).join("") : `<div class="px-2 py-1 text-mut">${empty}</div>`);
  }

  function setSidebar(open) {
    body.classList.toggle("sb-closed", !open);
    const t = $("#sidebar-toggle");
    if (t) t.setAttribute("aria-expanded", String(open));
  }

  document.addEventListener("click", (e) => {
    const nn = e.target.closest("[data-new-note]");
    if (nn) NS.createNote(nn);
    if (e.target.closest("#sidebar-toggle")) setSidebar(body.classList.contains("sb-closed"));
    if (e.target.id === "backdrop") setSidebar(false);
  });

  if (innerWidth <= 760) setSidebar(false);

  renderSidebar();
  NS.icons();
  try {
    const f = sessionStorage.getItem("ns-flash");
    if (f) { sessionStorage.removeItem("ns-flash"); NS.toast(f); }
  } catch (e) {}
  NS.load().then(() => NS.icons());
})();