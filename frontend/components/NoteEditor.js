"use client";
// Trang soạn ghi chú: tự động lưu, yêu thích, trash/restore/delete, AI Assistant.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import Topbar from "./Topbar";
import { useMenu } from "./Menu";
import { useNotes } from "./NotesProvider";
import { useUI } from "./UIProvider";
import { api } from "@/lib/api";
import { fmtDate, noteIcon, noteTitle } from "@/lib/utils";

const EMO = ["📄", "📝", "💡", "📚", "✅", "🎯", "🌱", "🗓️", "💼", "🧠", "🎨", "⭐"];
const AI = {
  summarize: { label: "Summary", apply: "Insert at top" },
  improve: { label: "Improved writing", apply: "Replace text" },
  title: { label: "Suggested title", apply: "Use as title" },
};
const parseTags = (v) => v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);

export default function NoteEditor({ id }) {
  const router = useRouter();
  const { upsert, update, destroy } = useNotes();
  const { toast, confirm } = useUI();
  const [menu, openMenu] = useMenu();

  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("");
  const [ai, setAi] = useState(null); // { action, busy, result }

  const st = useRef({ dirty: false, saving: false, pending: false, timer: null });
  const latest = useRef({});
  latest.current = { title, content, tags, note };
  const saveRef = useRef();
  const titleRef = useRef(null);
  const areaRef = useRef(null);
  const ro = !!note?.trashed;
  const shownTitle = title.trim() || "Untitled";

  /* ---------- load ---------- */
  useEffect(() => {
    let live = true;
    api.getNote(id)
      .then((n) => {
        if (!live) return;
        setNote(n);
        setTitle(n.title === "Untitled" ? "" : n.title || "");
        setContent(n.content || "");
        setTags((n.tags || []).join(", "));
        if (!n.trashed && !n.content && (!n.title || n.title === "Untitled")) setTimeout(() => titleRef.current?.focus(), 0);
      })
      .catch((e) => live && setError(/not found|invalid/i.test(e.message)
        ? "This note doesn’t exist or was deleted."
        : `Could not load this note: ${e.message}`));
    return () => { live = false; };
  }, [id]);

  useEffect(() => { if (note) document.title = `${shownTitle} · NoteSpace`; }, [note, shownTitle]);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [content, note]);

  /* ---------- autosave ---------- */
  const save = useCallback(async (opts) => {
    const s = st.current;
    clearTimeout(s.timer);
    s.timer = null;
    const { title, content, tags, note } = latest.current;
    if (!note || note.trashed || !s.dirty) return;
    if (s.saving) { s.pending = true; return; }
    s.saving = true;
    s.dirty = false;
    try {
      const u = await api.updateNote(id, { title: title.trim() || "Untitled", content, tags: parseTags(tags) }, opts);
      setNote(u);
      upsert(u);
      setStatus(s.dirty ? "Saving…" : "Saved");
    } catch (e) {
      s.dirty = true;
      setStatus("Not saved");
      toast("Could not save: " + e.message);
    } finally {
      s.saving = false;
      if (s.pending) { s.pending = false; saveRef.current(); }
    }
  }, [id, upsert, toast]);
  saveRef.current = save;

  const schedule = () => {
    const s = st.current;
    s.dirty = true;
    setStatus("Saving…");
    clearTimeout(s.timer);
    s.timer = setTimeout(() => saveRef.current(), 700);
  };

  // Lưu khi đóng tab / rời trang
  useEffect(() => {
    const flush = () => { if (st.current.dirty) saveRef.current({ keepalive: true }); };
    const vis = () => { if (document.visibilityState === "hidden") flush(); };
    addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", vis);
    return () => {
      removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", vis);
      flush();
    };
  }, []);

  /* ---------- actions ---------- */
  async function toTrash() {
    await save();
    if (await update(latest.current.note, { trashed: true })) { toast("Moved to Trash."); router.push("/"); }
  }
  async function restore() {
    const u = await update(note, { trashed: false });
    if (u) { setNote(u); toast("Restored."); }
  }
  async function destroyNote() {
    const ok = await confirm({
      title: "Delete permanently?",
      text: `“${noteTitle(note)}” will be removed forever. This can’t be undone.`,
      ok: "Delete",
    });
    if (ok && (await destroy(note))) { toast("Note deleted permanently."); router.push("/trash"); }
  }
  async function togglePin() {
    const u = await update(note, { pinned: !note.pinned });
    if (u) { setNote((n) => ({ ...n, pinned: u.pinned })); toast(u.pinned ? "Added to favorites." : "Removed from favorites."); }
  }
  async function setIcon(m) {
    const u = await update(note, { icon: m });
    if (u) setNote((n) => ({ ...n, icon: u.icon }));
  }

  /* ---------- AI ---------- */
  async function runAI(action) {
    if (ro || ai?.busy) return;
    const text = content.trim();
    if (!text) { toast("Write something in the note first, then try again."); return; }
    setAi({ action, busy: true });
    try {
      const r = await api.ai(action, text);
      if (window.track) window.track("ai_" + action);
      setAi({ action, result: r.result });
    } catch (e) {
      setAi(null);
      toast("AI error: " + e.message);
    }
  }
  function applyAI() {
    if (!ai?.result || ro) return;
    if (ai.action === "title") setTitle(ai.result);
    else if (ai.action === "improve") setContent(ai.result);
    else setContent(`Summary: ${ai.result}\n\n${content}`);
    schedule();
    toast("AI result applied.");
    setAi(null);
  }

  /* ---------- render ---------- */
  if (error || !note) {
    return (
      <>
        <Topbar icon="📄" title="Note" />
        <main className="mx-auto w-full max-w-[760px] px-5 pb-40 pt-6 md:px-12 md:pt-10">
          <div className="py-10 text-mut2">
            {error ? (
              <><p className="mb-3">{error}</p><Link className="btn" href="/">Back to Home</Link></>
            ) : "Loading note…"}
          </div>
        </main>
      </>
    );
  }

  const actions = ro ? null : (
    <>
      <button className="ai-btn" type="button" aria-label="AI Assistant" aria-haspopup="menu"
        onClick={(e) => openMenu(e.currentTarget, [
          { label: "✦  Summarize note", fn: () => runAI("summarize") },
          { label: "✦  Improve writing", fn: () => runAI("improve") },
          { label: "✦  Suggest title", fn: () => runAI("title") },
        ])}><Sparkles />AI</button>
      <button className="icon-btn" type="button" aria-label="Favorite" aria-pressed={!!note.pinned} onClick={togglePin}>
        <Star className={note.pinned ? "text-[#E8B02E] fill-[#E8B02E]" : ""} />
      </button>
      <button className="icon-btn" type="button" aria-label="More actions" aria-haspopup="menu"
        onClick={(e) => openMenu(e.currentTarget, [{ label: "Move to Trash", danger: true, fn: toTrash }])}><Ellipsis /></button>
    </>
  );

  return (
    <>
      <Topbar icon={noteIcon(note)} title={shownTitle} status={status} actions={actions} />
      <main className="mx-auto w-full max-w-[760px] px-5 pb-40 pt-6 md:px-12 md:pt-10">
        <article>
          {ro && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-hov px-4 py-3">
              <span>This note is in Trash.</span>
              <span className="flex gap-2">
                <button className="btn" type="button" onClick={restore}>Restore</button>
                <button className="btn btn-ghost-danger" type="button" onClick={destroyNote}>Delete permanently</button>
              </span>
            </div>
          )}
          <button className="-ml-2 grid h-20 w-20 place-items-center rounded-lg text-6xl leading-none hover:bg-hov disabled:hover:bg-transparent"
            type="button" aria-label="Change icon" aria-haspopup="menu" disabled={ro}
            onClick={(e) => openMenu(e.currentTarget, EMO.map((m) => ({ label: m, aria: "Use icon " + m, fn: () => setIcon(m) })), "emo")}>
            {noteIcon(note)}
          </button>
          <input ref={titleRef} className="my-2 w-full bg-transparent text-[32px] font-bold leading-tight outline-none placeholder:text-mut md:text-[40px]"
            type="text" placeholder="Untitled" maxLength={200} aria-label="Note title" autoComplete="off" disabled={ro}
            value={title}
            onChange={(e) => { setTitle(e.target.value); schedule(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); areaRef.current?.focus(); } }} />
          <div className="mb-4 border-b border-line pb-3 text-[13px]">
            <label className="flex min-h-[30px] items-center gap-2"><span className="w-[120px] flex-none text-mut">Tags</span>
              <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-mut" type="text"
                placeholder="Empty (separate with commas)" aria-label="Tags" disabled={ro}
                value={tags} onChange={(e) => { setTags(e.target.value); schedule(); }} />
            </label>
            <div className="flex min-h-[30px] items-center gap-2"><span className="w-[120px] flex-none text-mut">Last edited</span><span>{fmtDate(note.updatedAt)}</span></div>
          </div>
          <div aria-live="polite">
            {ai && (
              <div className="aibox">
                <div className="lb"><Sparkles />AI · {AI[ai.action].label}{ai.busy ? "" : " (preview)"}</div>
                {ai.busy ? <div className="tx">Thinking…</div> : (
                  <>
                    <div className="tx">{ai.result}</div>
                    <div className="acts">
                      <button className="btn btn-primary" type="button" onClick={applyAI}>{AI[ai.action].apply}</button>
                      <button className="btn" type="button" onClick={() => setAi(null)}>Discard</button>
                      <span className="hint">Your note stays unchanged until you apply.</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <textarea ref={areaRef} className="min-h-[50vh] w-full resize-none bg-transparent leading-relaxed outline-none placeholder:text-mut"
            placeholder="Start writing…" aria-label="Note content" disabled={ro}
            value={content} onChange={(e) => { setContent(e.target.value); schedule(); }} />
        </article>
      </main>
      {menu}
    </>
  );
}
