import { createDB } from "../db/client.js";

export async function onRequest(context){

  const db = createDB(context.env);

  if(context.request.method === "GET"){

    const sales = await db
      .prepare(`
        SELECT *
        FROM sales
        ORDER BY id DESC
        LIMIT 100
      `)
      .all();

    return Response.json({
      success:true,
      data:sales.results || []
    });
  }

  // =========================
  // CHECKOUT
  // =========================

  const body =
    await context.request.json();

  const items =
    body.items || [];

  if(items.length === 0){

    return Response.json({
      success:false,
      error:"EMPTY_CART"
    });
  }

  let total = 0;

  for(const item of items){

    const lineTotal =
      Number(item.price) *
      Number(item.qty);

    total += lineTotal;

    await db
      .prepare(`
        INSERT INTO sales (
          menu_id,
          menu_name,
          qty,
          unit_price,
          total_price
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        item.id,
        item.name,
        item.qty,
        item.price,
        lineTotal
      )
      .run();

    // =========================
    // LOG
    // =========================

    await db
      .prepare(`
        INSERT INTO stock_logs (
          action,
          item_name,
          qty,
          note
        )
        VALUES (?, ?, ?, ?)
      `)
      .bind(
        "SALE",
        item.name,
        item.qty,
        "POS CHECKOUT"
      )
      .run();
  }

  return Response.json({
    success:true,
    data:{
      total_amount: total
    }
  });
}
