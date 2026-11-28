"use client";
import { PanelLeft } from "lucide-react";
import { useUI } from "./UIProvider";

export default function Topbar({ icon, title, status, actions }) {
  const { sidebarOpen, setSidebarOpen } = useUI();
  return (
    <header className="sticky top-0 z-10 flex h-[45px] items-center gap-2 bg-bg px-2.5">
      <button className="icon-btn flex-none" type="button" aria-label="Toggle sidebar" aria-expanded={sidebarOpen} aria-controls="sidebar"
        onClick={() => setSidebarOpen((o) => !o)}><PanelLeft /></button>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap">
        <span>{icon}</span><span className="truncate font-medium">{title}</span>
      </div>
      {status ? <span className="shrink-0 text-xs text-mut" role="status">{status}</span> : null}
      <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
    </header>
  );
}
