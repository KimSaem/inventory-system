export async function getStock(db) {
  const res = await db
    .prepare("SELECT * FROM stock ORDER BY id DESC")
    .all();

  return res?.results ?? [];
}

export async function updateStock(db, id, qty) {
  return await db
    .prepare("UPDATE stock SET quantity = ? WHERE id = ?")
    .bind(qty, id)
    .run();
}
