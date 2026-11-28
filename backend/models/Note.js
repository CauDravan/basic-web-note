import { randomBytes } from "node:crypto";
import { getDB } from "../config/db.js";

const fields = {
  title: "Untitled",
  content: "",
  parent_id: null,
  pinned: false,
  trashed: false,
  icon: "📄",
  color: "white",
  category: "NOTE",
  tags: [],
};
const columns = Object.keys(fields);
const selection = '_id, ' + columns.join(", ") + ', created_at AS "createdAt", updated_at AS "updatedAt"';

export const idPattern = /^[0-9a-f]{24}$/i;
export const newNoteId = () => randomBytes(12).toString("hex");

export function noteFields(body, creating) {
  const data = {};
  for (const column of columns) {
    const value = body[column];
    if (value === undefined || (creating && column === "trashed")) continue;
    const example = fields[column];
    if (column === "parent_id") {
      if (value && (typeof value !== "string" || !idPattern.test(value))) {
        throw new TypeError("Invalid parent note ID");
      }
      data[column] = value ? value.toLowerCase() : null;
    } else if (Array.isArray(example)) {
      if (!Array.isArray(value) || value.some((tag) => !validText(tag))) {
        throw new TypeError("Tags must be a list of text values");
      }
      data[column] = value;
    } else if (typeof example === "boolean") {
      if (typeof value !== "boolean") throw new TypeError(`${column} must be true or false`);
      data[column] = value;
    } else {
      if (!validText(value)) throw new TypeError(`${column} must be text`);
      data[column] = column === "title" ? value.trim() || example : value;
    }
  }
  return data;
}

function validText(value) {
  return typeof value === "string" && !value.includes("\0");
}

async function first(db, sql, values) {
  const { rows } = await db.query(sql, values);
  return rows[0];
}

export async function insertNote(db, note, { skipExisting = false } = {}) {
  const values = [note._id ?? newNoteId(), ...columns.map((key) => note[key] ?? fields[key])];
  values.push(note.createdAt ?? new Date(), note.updatedAt ?? new Date());
  const parameters = values.map((_, index) => `$${index + 1}`).join(", ");
  return first(db, `INSERT INTO notes (_id, ${columns.join(", ")}, created_at, updated_at)
    VALUES (${parameters})
    ${skipExisting ? "ON CONFLICT (_id) DO NOTHING" : ""}
    RETURNING ${selection}`, values);
}

const Note = {
  async find() {
    const { rows } = await getDB().query(`SELECT ${selection} FROM notes ORDER BY updated_at DESC, _id`);
    return rows;
  },
  findById(id) {
    return first(getDB(), `SELECT ${selection} FROM notes WHERE _id = $1`, [id]);
  },
  create(note) {
    return insertNote(getDB(), note);
  },
  update(id, note) {
    const changes = columns.filter((key) => Object.hasOwn(note, key));
    if (!changes.length) return this.findById(id);
    const assignments = changes.map((key, index) => `${key} = $${index + 2}`);
    return first(getDB(), `UPDATE notes SET ${assignments.join(", ")}, updated_at = now()
      WHERE _id = $1 RETURNING ${selection}`, [id, ...changes.map((key) => note[key])]);
  },
  delete(id) {
    return first(getDB(), `DELETE FROM notes WHERE _id = $1 RETURNING ${selection}`, [id]);
  },
};

export default Note;
