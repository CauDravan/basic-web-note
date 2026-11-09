import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test routes
app.get("/", (req, res) => {
  res.send("NoteSpace Backend is running!");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "NoteSpace API is working!",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
