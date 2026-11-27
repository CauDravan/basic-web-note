"use client";
// Popup menu: const [menu, openMenu] = useMenu(); openMenu(anchorEl, [{label, danger, aria, fn}], "emo")
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function useMenu() {
  const [m, setM] = useState(null);
  const open = useCallback((anchor, items, cls = "") => setM({ rect: anchor.getBoundingClientRect(), items, cls }), []);
  const close = useCallback(() => setM(null), []);
  return [m ? <Popup m={m} onClose={close} /> : null, open];
}

function Popup({ m, onClose }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const p = ref.current, r = m.rect;
    p.style.left = Math.max(8, Math.min(r.left, innerWidth - p.offsetWidth - 8)) + "px";
    p.style.top = Math.max(8, Math.min(r.bottom + 4, innerHeight - p.offsetHeight - 8)) + "px";
    p.firstElementChild && p.firstElementChild.focus();
  }, [m]);

  useEffect(() => {
    const out = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    const t = setTimeout(() => {
      document.addEventListener("mousedown", out);
      document.addEventListener("keydown", esc);
    });
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", out);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <div ref={ref} role="menu"
      className={"fixed z-50 max-h-80 overflow-auto rounded-lg border border-line bg-pop p-1 shadow-xl " +
        (m.cls === "emo" ? "emo grid grid-cols-6" : "min-w-[200px]")}>
      {m.items.map((it, i) => (
        <button key={i} type="button" role="menuitem" aria-label={it.aria}
          className={"pop-item" + (it.danger ? " danger" : "")}
          onClick={() => { onClose(); it.fn(); }}>
          {it.label}
        </button>
      ))}
    </div>
  );
}
