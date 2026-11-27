"use client";
// Toast, hộp xác nhận và trạng thái sidebar dùng chung cho toàn app.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const UICtx = createContext(null);
export const useUI = () => useContext(UICtx);

export default function UIProvider({ children }) {
  const [toastMsg, setToastMsg] = useState("");
  const [dlg, setDlg] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const timer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(""), 3500);
  }, []);

  // confirm({ title, text, ok }) -> Promise<boolean>
  const confirm = useCallback((opts) => new Promise((res) => setDlg({ ...opts, res })), []);

  useEffect(() => { if (window.innerWidth <= 760) setSidebarOpen(false); }, []);
  useEffect(() => { document.body.classList.toggle("sb-closed", !sidebarOpen); }, [sidebarOpen]);

  useEffect(() => {
    if (!dlg) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); dlg.res(false); setDlg(null); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [dlg]);

  const answer = (v) => { dlg.res(v); setDlg(null); };

  return (
    <UICtx.Provider value={{ toast, confirm, sidebarOpen, setSidebarOpen }}>
      {children}
      {toastMsg && <div id="toast" role="status" aria-live="polite">{toastMsg}</div>}
      {dlg && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
             onClick={(e) => e.target === e.currentTarget && answer(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="cf-h"
               className="w-full max-w-[420px] rounded-xl border border-line bg-bg p-5 shadow-2xl">
            <h2 id="cf-h" className="mb-2 text-lg font-semibold">{dlg.title}</h2>
            <p className="mb-4 text-mut2">{dlg.text}</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn" autoFocus onClick={() => answer(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => answer(true)}>{dlg.ok || "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </UICtx.Provider>
  );
}
