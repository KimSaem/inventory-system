export async function getItems(db) {
  const res = await db.prepare("SELECT * FROM items").all();
  return res.results || [];
}

export async function createItem(db, data) {
  return await db
    .prepare(
      `INSERT INTO items (name, home_qty, store_qty)
       VALUES (?, ?, ?)`
    )
    .bind(data.name, data.home_qty || 0, data.store_qty || 0)
    .run();
}

export async function deleteItem(db, id) {
  return await db
    .prepare("DELETE FROM items WHERE id = ?")
    .bind(id)
    .run();
}
