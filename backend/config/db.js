import pg from "pg";

let pool;

export function getDB() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is required");
    pool = new pg.Pool({ connectionString, max: 5, connectionTimeoutMillis: 5000 });
    pool.on("error", (error) => console.error("PostgreSQL pool error", error.code || error.name));
  }
  return pool;
}

export async function transaction(work) {
  const client = await getDB().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
