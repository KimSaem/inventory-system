import { createDB } from "../db/client.js";

export async function onRequest(context){

  const db = createDB(context.env);

  try{

    const body = await context.request.json();
    const items = body.items || [];

    if(!Array.isArray(items) || items.length === 0){
      return Response.json({
        success:false,
        error:"EMPTY_CART"
      }, {status:400});
    }

    // =========================
    // 1. PRE-CALC
    // =========================
    const ids = items.map(i => Number(i.id));

    const stockRes = await db
      .prepare(`
        SELECT * FROM stock
        WHERE id IN (${ids.map(()=>"?").join(",")})
      `)
      .bind(...ids)
      .all();

    const stockMap = new Map();
    for(const s of stockRes.results){
      stockMap.set(s.id, s);
    }

    let totalAmount = 0;
    const receiptItems = [];

    // =========================
    // 2. PROCESS CART
    // =========================
    for(const cart of items){

      const id = Number(cart.id);
      const qty = Number(cart.qty || 1);

      const stock = stockMap.get(id);

      if(!stock) continue;

      // STOCK CHECK
      if(Number(stock.store_qty) < qty){
        return Response.json({
          success:false,
          error:`NOT_ENOUGH_STOCK: ${stock.name}`
        },{status:400});
      }

      const newQty =
        Number(stock.store_qty) - qty;

      const price =
        Number(stock.price || 0);

      const total = price * qty;

      totalAmount += total;

      // =========================
      // STOCK UPDATE
      // =========================
      await db
        .prepare(`
          UPDATE stock
          SET store_qty = ?
          WHERE id = ?
        `)
        .bind(newQty, id)
        .run();

      // =========================
      // SALES TABLE
      // =========================
      await db
        .prepare(`
          INSERT INTO sales (
            stock_id,
            item_name,
            qty,
            price,
            total_price,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)
        .bind(
          id,
          stock.name,
          qty,
          price,
          total
        )
        .run();

      // =========================
      // LOG TABLE
      // =========================
      await db
        .prepare(`
          INSERT INTO stock_logs (
            stock_id,
            action,
            qty,
            note
          )
          VALUES (?, 'SALE', ?, 'POS AUTO SALE')
        `)
        .bind(id, qty)
        .run();

      // =========================
      // AI FEED
      // =========================
      await db
        .prepare(`
          UPDATE stock
          SET daily_usage = COALESCE(daily_usage,0) + ?
          WHERE id = ?
        `)
        .bind(qty, id)
        .run();

      receiptItems.push({
        id,
        name: stock.name,
        qty,
        price,
        total
      });
    }

    // =========================
    // 3. RESPONSE (POS READY)
    // =========================
    return Response.json({
      success:true,
      data:{
        total_amount: totalAmount,
        items: receiptItems
      }
    });

  }catch(e){

    return Response.json({
      success:false,
      error:e.message
    },{status:500});
  }
}
