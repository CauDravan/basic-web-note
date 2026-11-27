"use client";
// Store ghi chú (thay cho window.NS cũ): tải danh sách, upsert/xoá, tìm kiếm, tạo mới.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { noteId } from "@/lib/utils";
import { useUI } from "./UIProvider";

const NotesCtx = createContext(null);
export const useNotes = () => useContext(NotesCtx);

export default function NotesProvider({ children }) {
  const router = useRouter();
  const { toast } = useUI();
  const [notes, setNotes] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.getNotes();
      setNotes(Array.isArray(r) ? r : []);
      setReady(true);
      setError(null);
    } catch (e) {
      setError(e.message || "Unknown error");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const upsert = useCallback((note) => {
    setNotes((prev) => {
      const i = prev.findIndex((n) => noteId(n) === noteId(note));
      if (i < 0) return [note, ...prev];
      const next = [...prev];
      next[i] = note;
      return next;
    });
  }, []);

  const remove = useCallback((id) => setNotes((prev) => prev.filter((n) => noteId(n) !== id)), []);

  const update = useCallback(async (n, patch, opts) => {
    try {
      const u = await api.updateNote(noteId(n), patch, opts);
      upsert(u);
      return u;
    } catch (e) {
      toast("Could not save: " + e.message);
      return null;
    }
  }, [upsert, toast]);

  const destroy = useCallback(async (n) => {
    try {
      await api.deleteNote(noteId(n));
      remove(noteId(n));
      return true;
    } catch (e) {
      toast("Could not delete: " + e.message);
      return false;
    }
  }, [remove, toast]);

  const createNote = useCallback(async () => {
    setCreating(true);
    try {
      const n = await api.createNote({
        title: "Untitled", content: "", parent_id: null, pinned: false,
        icon: "📄", color: "white", category: "NOTE", tags: [],
      });
      if (window.track) window.track("create_note");
      upsert(n);
      router.push(`/notes/${encodeURIComponent(noteId(n))}`);
    } catch (e) {
      toast("Could not create note: " + e.message);
    } finally {
      setCreating(false);
    }
  }, [router, toast, upsert]);

  const q = query.trim().toLowerCase();
  const value = useMemo(
    () => ({ notes, ready, error, query, q, setQuery, load, upsert, update, destroy, createNote, creating }),
    [notes, ready, error, query, q, load, upsert, update, destroy, createNote, creating]
  );
  return <NotesCtx.Provider value={value}>{children}</NotesCtx.Provider>;
}
