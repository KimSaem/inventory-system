import { createDB } from "../db/client.js";

export async function onRequest(context){

  try{

    const db =
      createDB(context.env);

    const method =
      context.request.method;

    const body =
      await context.request.json()
      .catch(()=>({}));

    // CREATE
    if(method === "POST"){

      if(!body.name){
        throw new Error("NAME_REQUIRED");
      }

      await db
        .prepare(`
          INSERT INTO stock (
            name,
            home_qty,
            store_qty
          )
          VALUES (?, ?, ?)
        `)
        .bind(
          body.name,
          body.home_qty || 0,
          body.store_qty || 0
        )
        .run();

      return Response.json({
        success:true
      });
    }

    // DELETE
    if(method === "DELETE"){

      await db
        .prepare(`
          DELETE FROM stock
          WHERE id = ?
        `)
        .bind(body.id)
        .run();

      return Response.json({
        success:true
      });
    }

    return Response.json({
      success:false,
      error:"METHOD_NOT_ALLOWED"
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
