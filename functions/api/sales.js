import { createDB } from "../db/client.js";

export async function onRequest(context){

  const { env, request } = context;

  try{

    const db = createDB(env);

    if(request.method === "GET"){

      const salesRes = await db
        .prepare(`
          SELECT *
          FROM sales
          ORDER BY created_at DESC
          LIMIT 300
        `)
        .all();

      return Response.json({
        success:true,
        data:salesRes.results || []
      });
    }

    if(request.method !== "POST"){

      return Response.json({
        success:false,
        error:"METHOD_NOT_ALLOWED"
      });
    }

    const body = await request.json();

    const items = body.items || [];

    if(!Array.isArray(items) || items.length === 0){

      return Response.json({
        success:false,
        error:"EMPTY_CART"
      });
    }

    let totalAmount = 0;

    let savedItems = [];

    for(const item of items){

      const stock_id = Number(item.id);

      const qty = Number(item.qty || 1);

      const price = Number(item.price || 1.8);

      const total_price = qty * price;

      totalAmount += total_price;

      const itemRes = await db
        .prepare(`
          SELECT *
          FROM stock
          WHERE id = ?
        `)
        .bind(stock_id)
        .all();

      const stockItem =
        itemRes?.results?.[0];

      if(!stockItem) continue;

      // SALES 저장
      await db
        .prepare(`
          INSERT INTO sales (
            stock_id,
            name,
            qty,
            price,
            total_price,
            category,
            created_at
          )
          VALUES (
            ?, ?, ?, ?, ?, ?,
            CURRENT_TIMESTAMP
          )
        `)
        .bind(
          stock_id,
          stockItem.name,
          qty,
          price,
          total_price,
          stockItem.category || "GENERAL"
        )
        .run();

      // 판매량 학습
      await db
        .prepare(`
          UPDATE stock
          SET daily_usage =
            COALESCE(daily_usage,0) + ?
          WHERE id = ?
        `)
        .bind(qty, stock_id)
        .run();

      // 로그 저장
      await db
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
          stock_id,
          "SALE",
          qty,
          "POS PAYMENT"
        )
        .run();

      savedItems.push({
        name:stockItem.name,
        qty,
        total_price
      });
    }

    return Response.json({
      success:true,
      total_amount:totalAmount,
      items:savedItems
    });

  }catch(e){

    return Response.json({
      success:false,
      error:e.message
    });
  }
}
