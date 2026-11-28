"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Info, Search, Settings, SquarePen, Star, Trash2 } from "lucide-react";
import { useNotes } from "./NotesProvider";
import { useUI } from "./UIProvider";
import { byUpdated, matches, noteIcon, noteId, noteTitle } from "@/lib/utils";

const NAV = [
  { href: "/", icon: House, label: "Home" },
  { href: "/pinned", icon: Star, label: "Pinned" },
  { href: "/trash", icon: Trash2, label: "Trash" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { notes, ready, error, query, q, setQuery, createNote, creating } = useNotes();
  const { sidebarOpen, setSidebarOpen } = useUI();

  // Trên mobile, đóng sidebar sau khi chuyển trang
  useEffect(() => { if (window.innerWidth <= 760) setSidebarOpen(false); }, [pathname, setSidebarOpen]);

  const live = notes.filter((n) => !n.trashed && matches(n, q)).sort(byUpdated);
  const favs = live.filter((n) => n.pinned);
  const empty = error ? "Could not load notes" : !ready ? "Loading…" : q ? "No results" : "No pages yet";

  const link = (n) => {
    const href = `/notes/${encodeURIComponent(noteId(n))}`;
    const active = pathname === href;
    return (
      <Link key={noteId(n)} href={href} className={"sb-item" + (active ? " active" : "")} aria-current={active ? "page" : undefined}>
        <span className="w-5 flex-none text-center">{noteIcon(n)}</span>
        <span className="min-w-0 truncate">{noteTitle(n)}</span>
      </Link>
    );
  };

  const nav = (href, Icon, label) => (
    <Link key={href} href={href} className={"sb-item" + (pathname === href ? " active" : "")}
      aria-current={pathname === href ? "page" : undefined}><Icon /><span>{label}</span></Link>
  );

  return (
    <>
      <aside id="sidebar" inert={!sidebarOpen} className="sidebar fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-line bg-side p-1.5" aria-label="Sidebar">
        <div className="flex items-center gap-2 p-2 font-semibold">
          <span className="grid h-[22px] w-[22px] place-items-center rounded-[5px] bg-ink text-xs font-bold text-bg">N</span>NoteSpace
        </div>
        <label className="sb-item" htmlFor="search-input"><Search />
          <input id="search-input" type="search" placeholder="Search" autoComplete="off" aria-label="Search notes"
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <nav className="mt-1 grid gap-0.5" aria-label="Main">{NAV.map((i) => nav(i.href, i.icon, i.label))}</nav>
        <div className="my-1.5 flex-1 overflow-auto">
          {favs.length > 0 && <><div className="sec">Favorites</div>{favs.map(link)}</>}
          <div className="sec">Pages</div>
          {live.length ? live.map(link) : <div className="px-2 py-1 text-mut">{empty}</div>}
        </div>
        <button className="sb-item" type="button" disabled={creating} onClick={createNote}><SquarePen /><span>New note</span></button>
        {nav("/settings", Settings, "Settings")}
        {nav("/about", Info, "About")}
      </aside>
      <div id="backdrop" className="fixed inset-0 z-20 bg-black/30" aria-hidden="true" onClick={() => setSidebarOpen(false)} />
    </>
  );
}
