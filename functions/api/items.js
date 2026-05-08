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


    // =========================
    // CREATE ITEM
    // =========================
    if(method === "POST"){

      if(!body.name){
        throw new Error("NAME_REQUIRED");
      }

      await db
        .prepare(`
          INSERT INTO stock (
            name,
            home_qty,
            store_qty,
            supplier,
            min_stock,
            ai_enabled
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(
          body.name,
          body.home_qty || 0,
          body.store_qty || 0,
          body.supplier || "미지정",
          body.min_stock || 15,
          body.ai_enabled ? 1 : 0
        )
        .run();

      return Response.json({
        success:true
      });
    }


    // =========================
    // UPDATE ITEM
    // =========================
    if(method === "PUT"){

      await db
        .prepare(`
          UPDATE stock
          SET
            name = ?,
            supplier = ?,
            min_stock = ?,
            ai_enabled = ?
          WHERE id = ?
        `)
        .bind(
          body.name,
          body.supplier,
          body.min_stock,
          body.ai_enabled ? 1 : 0,
          body.id
        )
        .run();

      return Response.json({
        success:true
      });
    }


    // =========================
    // DELETE ITEM
    // =========================
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
