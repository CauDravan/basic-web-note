"use client";
import { PanelLeft } from "lucide-react";
import { useUI } from "./UIProvider";

export default function Topbar({ icon, title, status, actions }) {
  const { sidebarOpen, setSidebarOpen } = useUI();
  return (
    <header className="sticky top-0 z-10 flex h-[45px] items-center gap-2 bg-bg px-2.5">
      <button className="icon-btn" type="button" aria-label="Toggle sidebar" aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((o) => !o)}><PanelLeft /></button>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap">
        <span>{icon}</span><span className="truncate font-medium">{title}</span>
      </div>
      {status ? <span className="hidden text-xs text-mut sm:inline" aria-live="polite">{status}</span> : null}
      <div className="flex items-center gap-0.5">{actions}</div>
    </header>
  );
}
