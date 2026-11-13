// List pages: Home, Pinned, Trash. Renders notes from the API and handles row actions.
(function () {
  "use strict";
  const mode = document.body.dataset.page;
  const box = document.getElementById("notes-container");
  if (!box || !window.NS) return;
  const countEl = document.getElementById("notes-count");

  const EMPTY = {
    home: "No notes yet. Create your first note to get started.",
    pinned: "Nothing pinned yet. Click the star on a note to keep it here.",
    trash: "Trash is empty.",
  };

  function visible() {
    let list = NS.notes.filter(NS.matches);
    if (mode === "trash") return list.filter((n) => n.trashed);
    list = list.filter((n) => !n.trashed);
    if (mode === "pinned") list = list.filter((n) => n.pinned);
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  function message(text, retry) {
    const p = document.createElement("div");
    p.className = "py-6 text-mut";
    p.textContent = text;
    if (retry) {
      p.append(" ");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.dataset.a = "retry";
      b.textContent = "Try again";
      p.appendChild(b);
    }
    box.replaceChildren(p);
  }

  function render() {
    if (!NS.ready) {
      if (countEl) countEl.textContent = "";
      return message(NS.error ? `Could not load notes: ${NS.error}.` : "Loading notes…", !!NS.error);
    }
    const list = visible();
    if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? "note" : "notes"}`;
    const emptyTrash = document.getElementById("empty-trash");
    if (emptyTrash) emptyTrash.disabled = mode === "trash" && !NS.notes.some((n) => n.trashed);
    if (!list.length) return message(NS.query ? "No notes match your search." : EMPTY[mode]);
    box.replaceChildren(...list.map((n) => NS.noteRow(n, { trash: mode === "trash" })));
    NS.icons();
  }

  box.addEventListener("click", async (e) => {
    if (e.target.closest('[data-a="retry"]')) return NS.load();
    const row = e.target.closest(".note-row");
    const n = row && NS.find(row.dataset.id);
    if (!n) return;
    const a = e.target.closest("[data-a]");
    if (!a) { location.href = NS.url.note(NS.id(n)); return; }
    switch (a.dataset.a) {
      case "pin":
        if (await NS.update(n, { pinned: !n.pinned })) NS.toast(n.pinned ? "Removed from favorites." : "Added to favorites.");
        break;
      case "trash":
        if (await NS.update(n, { trashed: true })) NS.toast("Moved to Trash.");
        break;
      case "restore":
        if (await NS.update(n, { trashed: false })) NS.toast("Restored.");
        break;
      case "delete":
        if (await NS.confirmDelete(n)) if (await NS.destroy(n)) NS.toast("Note deleted permanently.");
        break;
    }
  });

  box.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("note-row")) location.href = NS.url.note(e.target.dataset.id);
  });

  const emptyBtn = document.getElementById("empty-trash");
  if (emptyBtn) {
    emptyBtn.addEventListener("click", async () => {
      const trashed = NS.notes.filter((n) => n.trashed);
      if (!trashed.length) return;
      const ok = await NS.confirm({
        title: "Empty Trash?",
        text: `${trashed.length} ${trashed.length === 1 ? "note" : "notes"} will be removed forever. This can’t be undone.`,
        ok: "Empty Trash",
      });
      if (!ok) return;
      let failed = 0;
      for (const n of trashed) if (!(await NS.destroy(n))) failed++;
      if (!failed) NS.toast("Trash emptied.");
    });
  }

  document.addEventListener("ns:notes", render);
  render();
})();