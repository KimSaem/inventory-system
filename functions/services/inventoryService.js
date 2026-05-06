import { insertLog } from "./logService.js";

export async function transferStock(db, itemId, qty) {
  if (!qty || qty <= 0) {
    throw new Error("INVALID_QTY");
  }

  const itemRes = await db
    .prepare("SELECT * FROM items WHERE id = ?")
    .bind(itemId)
    .all();

  const item = itemRes.results?.[0];

  if (!item) throw new Error("ITEM_NOT_FOUND");
  if (item.home_qty < qty) throw new Error("NOT_ENOUGH_STOCK");

  const newHome = item.home_qty - qty;
  const newStore = item.store_qty + qty;

  await db
    .prepare(
      `UPDATE items
       SET home_qty = ?, store_qty = ?
       WHERE id = ?`
    )
    .bind(newHome, newStore, itemId)
    .run();

  await insertLog(db, {
    item_id: itemId,
    from: "home",
    to: "store",
    qty
  });

  return { success: true };
}
