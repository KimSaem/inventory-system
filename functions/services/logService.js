export async function createLog(db,data){

  return await db
    .prepare(`
      INSERT INTO stock_logs (
        stock_id,
        action,
        qty,
        note
      )
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      data.stock_id,
      data.action,
      data.qty,
      data.note || ""
    )
    .run();
}
