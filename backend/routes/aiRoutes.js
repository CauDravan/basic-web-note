import express from "express";
import { runAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/", runAI);

export default router;
