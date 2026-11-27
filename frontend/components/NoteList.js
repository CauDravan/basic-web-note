"use client";
// Danh sách ghi chú cho Home / Pinned / Trash.
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Star, Trash2, Undo2 } from "lucide-react";
import { useNotes } from "./NotesProvider";
import { useUI } from "./UIProvider";
import { byUpdated, fmtDate, matches, noteIcon, noteId, noteTitle } from "@/lib/utils";

const EMPTY = {
  home: "No notes yet. Create your first note to get started.",
  pinned: "Nothing pinned yet. Click the star on a note to keep it here.",
  trash: "Trash is empty.",
};
const LABEL = { home: "Recently edited", pinned: "Favorites", trash: "Deleted notes" };

function IconBtn({ label, onClick, danger, children }) {
  return (
    <button type="button" className={"icon-btn" + (danger ? " btn-ghost-danger" : "")} aria-label={label} title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}>{children}</button>
  );
}

export default function NoteList({ mode }) {
  const router = useRouter();
  const { notes, ready, error, q, load, update, destroy, createNote, creating } = useNotes();
  const { toast, confirm } = useUI();

  const list = useMemo(() => {
    const m = notes.filter((n) => matches(n, q));
    if (mode === "trash") return m.filter((n) => n.trashed).sort(byUpdated);
    let l = m.filter((n) => !n.trashed);
    if (mode === "pinned") l = l.filter((n) => n.pinned);
    return l.sort(byUpdated);
  }, [notes, q, mode]);

  const hasTrashed = notes.some((n) => n.trashed);
  const open = (n) => router.push(`/notes/${encodeURIComponent(noteId(n))}`);

  async function pin(n) {
    if (await update(n, { pinned: !n.pinned })) toast(n.pinned ? "Removed from favorites." : "Added to favorites.");
  }
  async function trash(n) { if (await update(n, { trashed: true })) toast("Moved to Trash."); }
  async function restore(n) { if (await update(n, { trashed: false })) toast("Restored."); }
  async function del(n) {
    const ok = await confirm({
      title: "Delete permanently?",
      text: `“${noteTitle(n)}” will be removed forever. This can’t be undone.`,
      ok: "Delete",
    });
    if (ok && (await destroy(n))) toast("Note deleted permanently.");
  }
  async function emptyTrash() {
    const trashed = notes.filter((n) => n.trashed);
    if (!trashed.length) return;
    const ok = await confirm({
      title: "Empty Trash?",
      text: `${trashed.length} ${trashed.length === 1 ? "note" : "notes"} will be removed forever. This can’t be undone.`,
      ok: "Empty Trash",
    });
    if (!ok) return;
    let failed = 0;
    for (const n of trashed) if (!(await destroy(n))) failed++;
    if (!failed) toast("Trash emptied.");
  }

  let body;
  if (!ready) {
    body = (
      <div className="py-6 text-mut">
        {error ? `Could not load notes: ${error}. ` : "Loading notes…"}
        {error && <button type="button" className="btn" onClick={load}>Try again</button>}
      </div>
    );
  } else if (!list.length) {
    body = <div className="py-6 text-mut">{q ? "No notes match your search." : EMPTY[mode]}</div>;
  } else {
    body = list.map((n) => {
      const preview = (n.content || "").replace(/\s+/g, " ").trim().slice(0, 90);
      return (
        <article key={noteId(n)} tabIndex={0}
          className="note-row flex cursor-pointer items-center gap-2.5 border-b border-line px-2.5 py-2 hover:bg-hov"
          onClick={() => open(n)}
          onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) open(n); }}>
          <span className="w-5 flex-none text-center">{noteIcon(n)}</span>
          <span className="min-w-0 flex-1 truncate font-medium">{noteTitle(n)}</span>
          <span className="hidden min-w-0 max-w-[40%] truncate text-[13px] text-mut2 md:block">{preview}</span>
          <span className="whitespace-nowrap text-xs text-mut">{fmtDate(n.updatedAt)}</span>
          <span className="row-actions flex gap-0.5">
            {mode === "trash" ? (
              <>
                <IconBtn label="Restore" onClick={() => restore(n)}><Undo2 /></IconBtn>
                <IconBtn label="Delete permanently" danger onClick={() => del(n)}><Trash2 /></IconBtn>
              </>
            ) : (
              <>
                <IconBtn label={n.pinned ? "Remove from favorites" : "Add to favorites"} onClick={() => pin(n)}>
                  <Star className={n.pinned ? "text-[#E8B02E] fill-[#E8B02E]" : ""} />
                </IconBtn>
                <IconBtn label="Move to Trash" onClick={() => trash(n)}><Trash2 /></IconBtn>
              </>
            )}
          </span>
        </article>
      );
    });
  }

  return (
    <>
      <div className="flex items-center justify-between pb-1.5 pt-2.5">
        <h2 className="text-xs font-semibold text-mut">{LABEL[mode]}</h2>
        <span className="flex items-center gap-3">
          <span className="text-xs text-mut">{ready ? `${list.length} ${list.length === 1 ? "note" : "notes"}` : ""}</span>
          {mode === "home" && (
            <button className="btn btn-primary" type="button" disabled={creating} onClick={createNote}><Plus />New note</button>
          )}
          {mode === "trash" && (
            <button className="btn btn-ghost-danger" type="button" disabled={!hasTrashed} onClick={emptyTrash}>Empty Trash</button>
          )}
        </span>
      </div>
      <div aria-live="polite">{body}</div>
    </>
  );
}
