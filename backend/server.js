import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Đảm bảo đã kết nối DB trước mỗi request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => res.send("NoteSpace Backend is running!"));
app.get("/api/test", (req, res) => res.json({ message: "NoteSpace API is working!" }));

// Chỉ listen khi chạy local
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;