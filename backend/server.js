import express from "express";
import cors from "cors";
import "dotenv/config";
import { getDB } from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("NoteSpace Backend is running!"));
app.get("/api/test", async (req, res) => {
  try {
    await getDB().query("SELECT 1 FROM notes LIMIT 1");
    res.json({ message: "NoteSpace API is working!" });
  } catch (error) {
    console.error("Database health check failed", error.code || error.name);
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

// Chỉ listen khi chạy local
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
