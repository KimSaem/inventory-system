export async function insertLog(db, log) {
  const { item_id, from, to, qty } = log;

  await db.run(
    `INSERT INTO stock_logs (item_id, from_location, to_location, qty)
     VALUES (?, ?, ?, ?)`,
    [item_id, from, to, qty]
  );
}

export async function getLogs(db) {
  return await db.all(
    `SELECT * FROM stock_logs ORDER BY created_at DESC`
  );
}
