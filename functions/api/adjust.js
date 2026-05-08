import { createDB } from "../db/client.js";

export async function onRequest(context){

  try{

    const db =
      createDB(context.env);

    const body =
      await context.request.json();

    const stock_id =
      Number(body.stock_id);

    const home_qty =
      Number(body.home_qty);

    const store_qty =
      Number(body.store_qty);

    await db
      .prepare(`
        UPDATE stock
        SET
          home_qty = ?,
          store_qty = ?
        WHERE id = ?
      `)
      .bind(
        home_qty,
        store_qty,
        stock_id
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
