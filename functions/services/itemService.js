export async function createItem(db, data) {
  return await db.run(
    `INSERT INTO items (name, home_qty, store_qty)
     VALUES (?, ?, ?)`,
    [data.name, data.home_qty || 0, data.store_qty || 0]
  );
}

export async function updateItem(db, id, data) {
  return await db.run(
    `UPDATE items
     SET name = ?, home_qty = ?, store_qty = ?
     WHERE id = ?`,
    [data.name, data.home_qty, data.store_qty, id]
  );
}

export async function deleteItem(db, id) {
  return await db.run(
    `DELETE FROM items WHERE id = ?`,
    [id]
  );
}

export async function getItems(db) {
  return await db.all(`SELECT * FROM items`);
}
