import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

test("Notes REST API with PostgreSQL", async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, "Set TEST_DATABASE_URL to an initialized test database.");
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.VERCEL = "1";

  const { default: app } = await import("../server.js");
  const { getDB } = await import("../config/db.js");
  const db = getDB();
  const server = app.listen(0, "127.0.0.1");
  const ids = [];
  t.after(async () => {
    server.close();
    try {
      await db.query("DELETE FROM notes WHERE _id = ANY($1)", [ids]);
    } finally {
      await db.end();
    }
  });
  await once(server, "listening");

  async function request(path = "", method = "GET", body) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/notes${path}`, {
      method,
      ...(body === undefined ? {} : {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    });
    const data = await response.json();
    if (method === "POST" && response.status === 201) ids.push(data.data._id);
    return { status: response.status, ...data };
  }

  const title = `Ghi chú ${randomUUID()}`;
  const result = await request("", "POST", { title: `  ${title}  `, tags: ["Học tập", "SQL"] });
  assert.equal(result.status, 201);
  const note = result.data;
  const path = `/${note._id}`;

  await t.test("create, list, read and verify stored values", async () => {
    assert.equal(note.title, title);
    assert.deepEqual(note.tags, ["Học tập", "SQL"]);
    assert.equal(note.trashed, false);
    const read = await request(path);
    assert.deepEqual(read.data, note);
    const list = await request();
    assert.equal(list.count, list.data.length);
    assert.deepEqual(list.data.find((row) => row._id === note._id), note);
    const { rows } = await db.query("SELECT title, tags FROM notes WHERE _id = $1", [note._id]);
    assert.deepEqual(rows[0], { title, tags: note.tags });
  });

  await t.test("edit, pin, trash and restore without losing data", async () => {
    const content = "Dòng thứ nhất\nDòng thứ hai";
    assert.equal((await request(path, "PUT", { content, pinned: true })).status, 200);
    assert.equal((await request(path, "PUT", { trashed: true })).data.trashed, true);
    const restored = await request(path, "PUT", { trashed: false });
    assert.equal(restored.data.trashed, false);
    assert.equal(restored.data.pinned, true);
    assert.equal(restored.data.content, content);
    assert.equal(restored.data.createdAt, note.createdAt);
    assert.ok(restored.data.updatedAt >= note.updatedAt);
  });

  await t.test("validate IDs and remove parent references on deletion", async () => {
    assert.equal((await request("/bad-id")).status, 400);
    assert.equal((await request(path, "PUT", { title: 4 })).status, 400);
    assert.equal((await request(path, "PUT", { parent_id: note._id })).status, 400);
    const child = await request("", "POST", { title: `Child of ${title}`, parent_id: note._id });
    assert.equal(child.status, 201);
    assert.equal(child.data.parent_id, note._id);
    assert.equal((await request(path, "DELETE")).status, 200);
    assert.equal((await request(path)).status, 404);
    assert.equal((await request(`/${child.data._id}`)).data.parent_id, null);
    assert.equal((await request("", "POST", { parent_id: note._id })).status, 404);
  });
});
