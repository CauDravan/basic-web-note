import Topbar from "@/components/Topbar";
import SettingsPanel from "@/components/SettingsPanel";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <Topbar icon="⚙️" title="Settings" />
      <main className="mx-auto w-full max-w-[640px] px-5 pb-28 pt-6 md:px-12">
        <h1 className="mb-1.5 text-[28px] font-bold leading-tight md:text-[32px]">Settings</h1>
        <p className="mb-6 text-mut2">Changes apply instantly and are saved in this browser.</p>
        <SettingsPanel />
      </main>
    </>
  );
}
