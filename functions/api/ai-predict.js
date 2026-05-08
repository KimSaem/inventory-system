import { createDB } from "../db/client.js";

export async function onRequest(context){

  try{

    const db = createDB(context.env);

    const result = await db
      .prepare(`
        SELECT *
        FROM stock
      `)
      .all();

    const items = result.results || [];

    for(const item of items){

      const total =
        Number(item.home_qty || 0) +
        Number(item.store_qty || 0);

      // 최근 판매량 기반 예측
      const predicted =
        Math.ceil(
          (item.daily_usage || 1) * 7
        );

      // 최소재고 + 예측수요
      let ai_order =
        (item.min_stock || 15)
        + predicted
        - total;

      if(ai_order < 0){
        ai_order = 0;
      }

      await db
        .prepare(`
          UPDATE stock
          SET
            predicted_demand = ?,
            ai_order = ?
          WHERE id = ?
        `)
        .bind(
          predicted,
          ai_order,
          item.id
        )
        .run();
    }

    return Response.json({
      success:true
    });

  }catch(e){

    return Response.json({
      success:false,
      error:e.message
    });
  }
}
