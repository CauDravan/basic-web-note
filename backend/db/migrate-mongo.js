import "dotenv/config";
import mongoose from "mongoose";
import { getDB, transaction } from "../config/db.js";
import { insertNote } from "../models/Note.js";

if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required to read the old database");
const db = getDB();

try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  const source = mongoose.connection.collection("notes");
  const result = await transaction(async (client) => {
    await client.query("LOCK TABLE notes IN SHARE ROW EXCLUSIVE MODE");
    const parents = new Map();
    let inserted = 0;
    let skipped = 0;
    let missingParents = 0;
    for await (const doc of source.find()) {
      const id = doc._id.toHexString();
      const note = await insertNote(client, { ...doc, _id: id, parent_id: null }, { skipExisting: true });
      if (!note) {
        skipped++;
        continue;
      }
      inserted++;
      if (doc.parent_id && !doc.parent_id.equals(doc._id)) {
        parents.set(id, doc.parent_id.toHexString());
      }
    }
    for (const [id, parentId] of parents) {
      const { rowCount } = await client.query(`
        UPDATE notes SET parent_id = $2
        WHERE _id = $1 AND EXISTS (SELECT 1 FROM notes WHERE _id = $2)
      `, [id, parentId]);
      if (!rowCount) missingParents++;
    }
    return { inserted, skipped, missingParents };
  });
  console.log(`Imported ${result.inserted}, skipped ${result.skipped} existing notes, ${result.missingParents} missing parents.`);
} catch (error) {
  console.error("Migration failed.", error.code || error.name);
  process.exitCode = 1;
} finally {
  await Promise.all([mongoose.disconnect(), db.end()]);
}
