// Tạo dữ liệu mẫu cho NoteSpace.
//   npm run seed            -> chỉ thêm dữ liệu khi collection "notes" đang trống
//   npm run seed -- --reset -> XÓA TOÀN BỘ ghi chú hiện có rồi nạp lại dữ liệu mẫu
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Note from "../models/Note.js";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const reset = process.argv.includes("--reset");
const daysAgo = (d, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000);

const parentId = new mongoose.Types.ObjectId();
const note = (o) => ({
  _id: new mongoose.Types.ObjectId(),
  title: "Untitled",
  content: "",
  parent_id: null,
  pinned: false,
  trashed: false,
  icon: "📄",
  color: "white",
  category: "NOTE",
  tags: [],
  __v: 0,
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

async function run() {
  if (!process.env.MONGO_URI) throw new Error("Thiếu MONGO_URI. Hãy tạo file backend/.env (xem .env.example).");
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Note.countDocuments();
  if (existing > 0 && !reset) {
    console.log(`Đã có ${existing} ghi chú trong database, bỏ qua seed. Dùng "npm run seed -- --reset" để xóa và nạp lại.`);
    return;
  }
  if (reset) {
    const { deletedCount } = await Note.deleteMany({});
    console.log(`Đã xóa ${deletedCount} ghi chú cũ.`);
  }

  // Dùng collection trực tiếp để giữ nguyên createdAt/updatedAt đã đặt ở trên.
  const { insertedCount } = await Note.collection.insertMany(seedNotes);
  console.log(`Đã thêm ${insertedCount} ghi chú mẫu.`);
}

run()
  .catch((err) => {
    console.error("Seed thất bại:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());