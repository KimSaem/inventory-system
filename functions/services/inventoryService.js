import { insertLog } from "./logService.js";

export async function transferStock(db, itemId, qty) {
  if (!qty || qty <= 0) {
    throw new Error("INVALID_QTY");
  }

  const res = await db
    .prepare("SELECT * FROM stock WHERE id = ?")
    .bind(itemId)
    .all();

  const item = res.results?.[0];

  if (!item) throw new Error("ITEM_NOT_FOUND");

  if (item.quantity < qty) {
    throw new Error("NOT_ENOUGH_STOCK");
  }

  const newQty = item.quantity - qty;

  await db
    .prepare("UPDATE stock SET quantity = ? WHERE id = ?")
    .bind(newQty, itemId)
    .run();

  await insertLog(db, {
    stock_id: itemId,
    qty
  });

  await db
    .prepare(
      `INSERT INTO transfers (stock_id, qty, type)
       VALUES (?, ?, 'OUT')`
    )
    .bind(itemId, qty)
    .run();

  return { success: true };
}
