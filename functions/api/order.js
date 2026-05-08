import { createDB } from "../db/client.js";

export async function onRequest(context){

  try{

    const db =
      createDB(context.env);

    const body =
      await context.request.json();

    const stock_id =
      Number(body.stock_id);

    const qty =
      Number(body.qty);

    if(!stock_id || !qty){
      throw new Error("INVALID_INPUT");
    }

    // 상품 조회
    const res = await db
      .prepare(`
        SELECT *
        FROM stock
        WHERE id = ?
      `)
      .bind(stock_id)
      .all();

    const item =
      res?.results?.[0];

    if(!item){
      throw new Error("ITEM_NOT_FOUND");
    }

    // 재고 부족
    if(item.store_qty < qty){
      throw new Error("NOT_ENOUGH_STORE_STOCK");
    }

    // 매장 재고 감소
    const newQty =
      item.store_qty - qty;

    await db
      .prepare(`
        UPDATE stock
        SET store_qty = ?
        WHERE id = ?
      `)
      .bind(newQty, stock_id)
      .run();

    // 주문 생성
    await db
      .prepare(`
        INSERT INTO orders (
          stock_id,
          item_name,
          qty,
          total_price
        )
        VALUES (?, ?, ?, ?)
      `)
      .bind(
        stock_id,
        item.name,
        qty,
        qty * Number(item.price || 0)
      )
      .run();

    return Response.json({
      success:true
    });

  }catch(e){

    return Response.json({
      success:false,
      error:e.message
    },{
      status:400
    });
  }
}
