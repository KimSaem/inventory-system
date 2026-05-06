export async function insertLog(db, log) {
  const { item_id, from, to, qty } = log;

  return await db
    .prepare(
      `INSERT INTO stock_logs (item_id, from_location, to_location, qty)
       VALUES (?, ?, ?, ?)`
    )
    .bind(item_id, from, to, qty)
    .run();
}

export async function getLogs(db) {
  const res = await db
    .prepare("SELECT * FROM stock_logs ORDER BY created_at DESC")
    .all();

  return res.results || [];
}
