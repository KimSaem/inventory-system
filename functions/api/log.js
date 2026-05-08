import { createDB } from "../db/client.js";

export async function onRequest(context){

  try{

    const db = createDB(context.env);

    const res = await db
      .prepare(`
        SELECT *
        FROM stock_logs
        ORDER BY id DESC
        LIMIT 100
      `)
      .all();

    return Response.json({
      success:true,
      data:res?.results ?? []
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
