import { aiOrderCalculator }
from "../lib/ai-order.js";

export async function onRequestPost(context){

  try{

    const db = context.env.DB;

    const body =
      await context.request.json();

    const stock_id =
      body.stock_id;

    const item =
      await db.prepare(`
        SELECT *
        FROM stock
        WHERE id=?
      `)
      .bind(stock_id)
      .first();

    if(!item){

      return Response.json({
        success:false,
        error:"ITEM NOT FOUND"
      });
    }

    const ai_order =
      aiOrderCalculator(item);

    return Response.json({
      success:true,
      item:{
        ...item,
        ai_order
      }
    });

  }catch(err){

    return Response.json({
      success:false,
      error:err.message
    });
  }
}
