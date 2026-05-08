export async function getStock(db){

  const res = await db
    .prepare(`
      SELECT * FROM stock
      ORDER BY id DESC
    `)
    .all();

  return res?.results ?? [];
}

export async function getStockById(db,id){

  const res = await db
    .prepare(`
      SELECT * FROM stock
      WHERE id = ?
    `)
    .bind(id)
    .all();

  return res?.results?.[0] ?? null;
}

export async function updateStock(db,id,home,store){

  return await db
    .prepare(`
      UPDATE stock
      SET
        home_qty = ?,
        store_qty = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(home,store,id)
    .run();
}
