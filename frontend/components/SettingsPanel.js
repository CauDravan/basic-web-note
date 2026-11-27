"use client";
import { useEffect, useState } from "react";
import { Moon, PlugZap, Sun } from "lucide-react";
import { api } from "@/lib/api";
import { setTheme } from "@/lib/utils";
import { useUI } from "./UIProvider";

export default function SettingsPanel() {
  const { toast } = useUI();
  const [theme, setThemeState] = useState("light");
  const [testing, setTesting] = useState(false);

  useEffect(() => { setThemeState(document.documentElement.dataset.theme || "light"); }, []);

  const pick = (t) => { setTheme(t); setThemeState(t); toast(`Theme set to ${t}.`); };

  async function test() {
    setTesting(true);
    const t0 = performance.now();
    try {
      const notes = await api.getNotes();
      toast(`Connected: ${notes.length} notes, ${Math.round(performance.now() - t0)} ms.`);
    } catch (e) {
      toast("Connection failed: " + e.message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <section className="grp" aria-labelledby="h-theme">
        <h2 id="h-theme">Appearance</h2>
        <p>Choose how NoteSpace looks.</p>
        <div className="seg" role="group" aria-label="Theme">
          {[["light", Sun, "Light"], ["dark", Moon, "Dark"]].map(([k, Icon, label]) => (
            <button key={k} type="button" className={theme === k ? "active" : ""} aria-pressed={theme === k} onClick={() => pick(k)}>
              <Icon />{label}
            </button>
          ))}
        </div>
      </section>
      <section className="grp" aria-labelledby="h-api">
        <h2 id="h-api">Connection</h2>
        <p>Your notes are stored in the cloud through this API.</p>
        <p className="!mb-3 break-all !text-[13px] !text-mut2">{api.base}</p>
        <button className="btn" type="button" disabled={testing} onClick={test}><PlugZap />Test connection</button>
      </section>
    </>
  );
}
