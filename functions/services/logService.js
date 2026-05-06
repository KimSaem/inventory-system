export async function insertLog(db, { stock_id, action, qty, note }) {
  return await db
    .prepare(`
      INSERT INTO stock_logs (stock_id, action, qty, note)
      VALUES (?, ?, ?, ?)
    `)
    .bind(stock_id, action, qty, note || "")
    .run();
}

export async function getLogs(db) {
  const res = await db
    .prepare("SELECT * FROM stock_logs ORDER BY id DESC LIMIT 100")
    .all();

  return res?.results ?? [];
}
