// Tạo dữ liệu mẫu cho NoteSpace.
//   npm run seed            -> chỉ thêm dữ liệu khi bảng "notes" đang trống
//   npm run seed -- --reset -> XÓA TOÀN BỘ ghi chú hiện có rồi nạp lại dữ liệu mẫu
import "dotenv/config";
import { getDB, transaction } from "../config/db.js";
import { insertNote, newNoteId } from "../models/Note.js";

const reset = process.argv.includes("--reset");
const daysAgo = (d, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000);

const parentId = newNoteId();
const note = (o) => ({
  _id: newNoteId(),
  title: "Untitled",
  content: "",
  parent_id: null,
  pinned: false,
  trashed: false,
  icon: "📄",
  color: "white",
  category: "NOTE",
  tags: [],
  ...o,
});

const seedNotes = [
  note({
    title: "Weekly reset", icon: "🗓️", pinned: true, tags: ["Personal"],
    content: "A softer start to the week: review priorities, clear the inbox, and choose three meaningful things to focus on.",
    createdAt: daysAgo(9), updatedAt: daysAgo(1),
  }),
  note({
    title: "Ideas for the studio", icon: "💡", pinned: true, tags: ["Ideas"],
    content: "- Morning light for the reading corner\n- A shared shelf for sketchbooks\n- Try a weekly open-studio evening",
    createdAt: daysAgo(12), updatedAt: daysAgo(2),
  }),
  note({
    title: "Book notes: The Creative Act", icon: "📚", tags: ["Reading"],
    content: "Key idea: creativity is a practice, not a talent. Show up daily, keep the work small, and finish before you polish.",
    createdAt: daysAgo(20), updatedAt: daysAgo(4),
  }),
  note({
    title: "Việc cần làm tuần này", icon: "✅", tags: ["Work", "Kế hoạch"],
    content: "1. Hoàn thiện giao diện Home và Pinned\n2. Viết seeder và vẽ ERD\n3. Chạy Lighthouse và ghi lại điểm số\n4. Quay video demo",
    createdAt: daysAgo(5), updatedAt: daysAgo(0, 3),
  }),
  note({
    _id: parentId, title: "Kế hoạch học Web Development", icon: "🎯", tags: ["School"],
    content: "Mục tiêu: nắm vững HTML, CSS, JavaScript, Node.js và cách triển khai ứng dụng lên Vercel.",
    createdAt: daysAgo(14), updatedAt: daysAgo(3),
  }),
  note({
    title: "Checklist Final Project", icon: "🧠", parent_id: parentId, tags: ["School"],
    content: "Wireframe, project plan, GitHub Issues, Tailwind, CRUD, Lighthouse, Google Analytics, Sentry, peer review.",
    createdAt: daysAgo(6), updatedAt: daysAgo(2, 5),
  }),
  note({
    title: "Công thức mì trộn", icon: "🌱", tags: ["Personal"],
    content: "Mì, hành phi, nước tương, một thìa dầu mè. Trộn khi mì còn nóng và thêm trứng chiên.",
    createdAt: daysAgo(30), updatedAt: daysAgo(15),
  }),
  note({
    title: "Ý tưởng cũ (đã bỏ)", icon: "📝", trashed: true,
    content: "Ghi chú này nằm trong Trash, dùng để kiểm thử chức năng khôi phục và xóa vĩnh viễn.",
    createdAt: daysAgo(40), updatedAt: daysAgo(10),
  }),
];

const db = getDB();
try {
  const inserted = await transaction(async (client) => {
    await client.query("LOCK TABLE notes IN SHARE ROW EXCLUSIVE MODE");
    const { rowCount } = await client.query("SELECT 1 FROM notes LIMIT 1");
    if (rowCount && !reset) return 0;
    if (reset) await client.query("DELETE FROM notes");
    for (const note of seedNotes) await insertNote(client, note);
    return seedNotes.length;
  });
  console.log(inserted ? `Đã thêm ${inserted} ghi chú mẫu.` : "Bảng notes đã có dữ liệu, bỏ qua seed.");
} finally {
  await db.end();
}
