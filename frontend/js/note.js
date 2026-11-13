// Note page: open, edit with autosave, favorite, trash, restore, delete.
(function () {
  "use strict";
  if (document.body.dataset.page !== "note" || !window.NS) return;

  const $ = (s) => document.querySelector(s);
  const id = new URLSearchParams(location.search).get("id");
  const root = $("#note-root"), stateEl = $("#note-state");
  const titleEl = $("#title"), contentEl = $("#content"), tagsEl = $("#tags");
  const iconBtn = $("#icon-btn"), editedEl = $("#edited"), banner = $("#banner"), actions = $("#top-actions");
  const EMO = ["📄", "📝", "💡", "📚", "✅", "🎯", "🌱", "🗓️", "💼", "🧠", "🎨", "⭐"];
  let note = null, ro = false, dirty = false, saving = false, pending = false, timer = null;

  function showState(msg) {
    root.hidden = true;
    stateEl.hidden = false;
    stateEl.innerHTML = `<p class="mb-3 text-mut2">${NS.esc(msg)}</p><a class="btn" href="${NS.url.home}">Back to Home</a>`;
  }

  const parseTags = () => tagsEl.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
  const currentTitle = () => titleEl.value.trim() || "Untitled";
  function autosize() {
    contentEl.style.height = "auto";
    contentEl.style.height = contentEl.scrollHeight + "px";
  }
  function syncHead() {
    NS.setCrumb(NS.icon(note), currentTitle());
    document.title = `${currentTitle()} · NoteSpace`;
  }

  function renderActions() {
    if (ro) { actions.replaceChildren(); return; }
    actions.innerHTML = `
      <button id="star-btn" class="icon-btn" type="button" aria-label="Favorite" aria-pressed="${!!note.pinned}"><i data-lucide="star" class="${note.pinned ? "text-[#E8B02E] fill-[#E8B02E]" : ""}"></i></button>
      <button id="more-btn" class="icon-btn" type="button" aria-label="More actions" aria-haspopup="menu"><i data-lucide="ellipsis"></i></button>`;
    NS.icons();
  }

  function renderBanner() {
    banner.innerHTML = ro
      ? `<div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-hov px-4 py-3">
           <span>This note is in Trash.</span>
           <span class="flex gap-2"><button class="btn" type="button" data-a="restore">Restore</button><button class="btn btn-ghost-danger" type="button" data-a="delete">Delete permanently</button></span>
         </div>`
      : "";
  }

  function fill() {
    ro = !!note.trashed;
    iconBtn.textContent = NS.icon(note);
    titleEl.value = note.title === "Untitled" ? "" : note.title || "";
    contentEl.value = note.content || "";
    tagsEl.value = (note.tags || []).join(", ");
    editedEl.textContent = NS.fmtDate(note.updatedAt);
    [titleEl, contentEl, tagsEl, iconBtn].forEach((el) => (el.disabled = ro));
    stateEl.hidden = true;
    root.hidden = false;
    renderBanner();
    renderActions();
    syncHead();
    autosize();
    if (!ro && !note.content && (!note.title || note.title === "Untitled")) titleEl.focus();
  }

  /* ---------- autosave ---------- */
  function schedule() {
    dirty = true;
    NS.setStatus("Saving…");
    clearTimeout(timer);
    timer = setTimeout(() => save(), 700);
  }

  async function save(opts) {
    clearTimeout(timer);
    timer = null;
    if (!note || ro || !dirty) return;
    if (saving) { pending = true; return; }
    saving = true;
    dirty = false;
    try {
      const u = await window.api.updateNote(id, { title: currentTitle(), content: contentEl.value, tags: parseTags() }, opts);
      note = u;
      NS.upsert(u);
      editedEl.textContent = NS.fmtDate(u.updatedAt);
      NS.setStatus(dirty ? "Saving…" : "Saved");
    } catch (e) {
      dirty = true;
      NS.setStatus("Not saved");
      NS.toast("Could not save: " + e.message);
    } finally {
      saving = false;
      if (pending) { pending = false; save(); }
    }
  }

  titleEl.addEventListener("input", () => { syncHead(); schedule(); });
  contentEl.addEventListener("input", () => { autosize(); schedule(); });
  tagsEl.addEventListener("input", schedule);
  titleEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); contentEl.focus(); }
  });
  // Best-effort save when leaving the page
  addEventListener("pagehide", () => { if (dirty) save({ keepalive: true }); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && dirty) save({ keepalive: true });
  });

  /* ---------- actions ---------- */
  async function toTrash() {
    await save();
    if (await NS.update(note, { trashed: true })) { NS.flash("Moved to Trash."); location.href = NS.url.home; }
  }
  async function restore() {
    if (await NS.update(note, { trashed: false })) { NS.flash("Restored."); location.reload(); }
  }
  async function destroy() {
    if (!(await NS.confirmDelete(note))) return;
    if (await NS.destroy(note)) { NS.flash("Note deleted permanently."); location.href = NS.url.trash; }
  }

  actions.addEventListener("click", async (e) => {
    if (e.target.closest("#star-btn")) {
      const u = await NS.update(note, { pinned: !note.pinned });
      if (u) { note = { ...note, pinned: u.pinned }; renderActions(); NS.toast(u.pinned ? "Added to favorites." : "Removed from favorites."); }
    }
    const more = e.target.closest("#more-btn");
    if (more) NS.menu(more, [{ label: "Move to Trash", danger: true, fn: toTrash }]);
  });

  banner.addEventListener("click", (e) => {
    const a = e.target.closest("[data-a]");
    if (!a) return;
    if (a.dataset.a === "restore") restore();
    if (a.dataset.a === "delete") destroy();
  });

  iconBtn.addEventListener("click", () => {
    if (ro) return;
    NS.menu(iconBtn, EMO.map((m) => ({
      html: m, aria: "Use icon " + m,
      fn: async () => {
        const u = await NS.update(note, { icon: m });
        if (u) { note = { ...note, icon: u.icon }; iconBtn.textContent = m; syncHead(); }
      },
    })), "emo");
  });

  /* ---------- load ---------- */
  if (!id) {
    showState("No note selected.");
  } else {
    window.api.getNote(id).then((n) => { note = n; fill(); })
      .catch((e) => showState(/not found|invalid/i.test(e.message) ? "This note doesn’t exist or was deleted." : `Could not load this note: ${e.message}`));
  }
})();