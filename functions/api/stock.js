import { createDB } from "../db/client.js";
import { getStock } from "../services/stockService.js";

export async function onRequest(context){

  try{

    const db = createDB(context.env);

    const stock = await getStock(db);

    return Response.json({
      success:true,
      data:stock
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
