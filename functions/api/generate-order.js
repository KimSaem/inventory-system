import { createDB } from "../db/client.js";

export async function onRequest(context){

  try{

    const db = createDB(context.env);

    const result = await db
      .prepare(`
        SELECT *
        FROM stock
        WHERE ai_order > 0
      `)
      .all();

    const items = result.results || [];

    const grouped = {};

    for(const item of items){

      const supplier =
        item.supplier || "미지정";

      if(!grouped[supplier]){
        grouped[supplier] = [];
      }

      grouped[supplier].push({
        name:item.name,
        qty:item.ai_order
      });
    }

    return Response.json({
      success:true,
      orders:grouped
    });

  }catch(e){

    return Response.json({
      success:false,
      error:e.message
    });
  }
}
