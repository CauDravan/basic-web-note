import "dotenv/config";
import { readFile } from "node:fs/promises";
import { getDB } from "../config/db.js";

const db = getDB();
try {
  await db.query(await readFile(new URL("./schema.sql", import.meta.url), "utf8"));
  console.log("PostgreSQL schema is ready.");
} finally {
  await db.end();
}
