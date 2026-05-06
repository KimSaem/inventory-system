export async function insertLog(db, log) {
  return await db
    .prepare(
      `INSERT INTO stock_logs (stock_id, qty)
       VALUES (?, ?)`
    )
    .bind(log.stock_id, log.qty)
    .run();
}

export async function getLogs(db) {
  const res = await db
    .prepare("SELECT * FROM stock_logs ORDER BY id DESC")
    .all();

  return res.results ?? [];
}
