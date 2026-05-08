import {
  getStockById,
  updateStock
} from "./stockService.js";

import {
  createLog
} from "./logService.js";

export async function transferStock(
  db,
  stock_id,
  qty,
  from,
  to
){

  const item = await getStockById(db,stock_id);

  if(!item){
    throw new Error("ITEM_NOT_FOUND");
  }

  let home = Number(item.home_qty);
  let store = Number(item.store_qty);

  // Home -> Store
  if(from === "home" && to === "store"){

    if(home < qty){
      throw new Error("NOT_ENOUGH_HOME_STOCK");
    }

    home -= qty;
    store += qty;
  }

  // Store -> Home
  if(from === "store" && to === "home"){

    if(store < qty){
      throw new Error("NOT_ENOUGH_STORE_STOCK");
    }

    store -= qty;
    home += qty;
  }

  await updateStock(
    db,
    stock_id,
    home,
    store
  );

  // transfer log
  await db
    .prepare(`
      INSERT INTO transfers (
        stock_id,
        qty,
        from_location,
        to_location,
        type
      )
      VALUES (?, ?, ?, ?, 'MOVE')
    `)
    .bind(
      stock_id,
      qty,
      from,
      to
    )
    .run();

  // stock log
  await createLog(db,{
    stock_id,
    action:"MOVE",
    qty,
    note:`${from} -> ${to}`
  });

  return {
    success:true
  };
}
