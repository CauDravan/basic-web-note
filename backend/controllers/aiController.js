import { generate, AI_ACTIONS, AI_MAX_CHARS } from "../services/aiService.js";

// POST /api/ai  { action: "summarize" | "improve" | "title", text: string }
export const runAI = async (req, res) => {
  const { action, text } = req.body || {};

  if (!AI_ACTIONS.includes(action)) {
    return res.status(400).json({ success: false, message: `action must be one of: ${AI_ACTIONS.join(", ")}` });
  }
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ success: false, message: "text is required" });
  }
  if (text.length > AI_MAX_CHARS) {
    return res.status(400).json({ success: false, message: `Note is too long for AI (max ${AI_MAX_CHARS} characters).` });
  }

  try {
    const result = await generate(action, text.trim());
    res.status(200).json({ success: true, data: { action, result } });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.publicMessage || "AI request failed" });
  }
};
