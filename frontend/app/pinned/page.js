import Topbar from "@/components/Topbar";
import NoteList from "@/components/NoteList";

export const metadata = { title: "Pinned" };

export default function Page() {
  return (
    <>
      <Topbar icon="⭐" title="Pinned" />
      <main className="mx-auto w-full max-w-[856px] px-5 pb-28 pt-6 md:px-12">
        <h1 className="mb-1.5 text-[28px] font-bold leading-tight md:text-[32px]">Pinned</h1>
        <p className="mb-6 text-mut2">Notes you starred for quick access.</p>
        <NoteList mode="pinned" />
      </main>
    </>
  );
}
