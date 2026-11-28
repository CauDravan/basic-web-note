import Link from "next/link";
import { ArrowUpRight, PencilLine, Search, Sparkles } from "lucide-react";
import Topbar from "@/components/Topbar";

export const metadata = {
  title: "About",
  description: "Learn about NoteSpace, the note-taking web app made by Group 5 for CSB25022.",
};

const features = [
  { icon: PencilLine, title: "Write with autosave", detail: "Create notes and pick up where you left off." },
  { icon: Search, title: "Find what you wrote", detail: "Search by title, content or tag, and pin notes for quick access." },
  { icon: Sparkles, title: "Review AI suggestions", detail: "Preview a summary, rewrite or suggested title before applying it." },
];

export default function AboutPage() {
  return (
    <>
      <Topbar icon="ℹ️" title="About" />
      <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 md:px-12 md:pt-10">
        <h1 className="mb-2 text-[28px] font-bold leading-tight md:text-[32px]">About NoteSpace</h1>
        <p className="max-w-prose text-mut2">
          NoteSpace is a web app for collecting study notes and ideas. It was built by Group 5 of Basic 2 for
          CSB25022, Web Design and Development.
        </p>
        <ul className="my-6 divide-y divide-line rounded-lg border border-line">
          {features.map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex gap-3 px-4 py-3">
              <Icon aria-hidden="true" className="mt-0.5 size-[18px] flex-none text-mut2" />
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-0.5 text-mut2">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="btn btn-primary">Open notes</Link>
          <a href="https://github.com/CauDravan/basic-web-note" className="btn">
            View project on GitHub <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </main>
    </>
  );
}
