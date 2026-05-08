import { createDB } from "../db/client.js";

export async function onRequest(context){

  try{

    const db =
      createDB(context.env);

    const result =
      await db
        .prepare(`
          SELECT
            id,
            name,
            home_qty,
            store_qty,
            supplier,
            min_stock,
            ai_enabled
          FROM stock
          ORDER BY id DESC
        `)
        .all();

    return Response.json({
      success:true,
      data: result.results || []
    });

  }catch(e){

    return Response.json({
      success:false,
      error:e.message
    },{
      status:500
    });
  }
}
