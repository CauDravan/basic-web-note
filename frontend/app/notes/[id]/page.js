import NoteEditor from "@/components/NoteEditor";

export default async function Page({ params }) {
  const { id } = await params;
  return <NoteEditor key={id} id={id} />;
}
