import { createDB } from "../db/client.js";

      await db
        .prepare(`
          INSERT INTO stock (
            name,
            home_qty,
            store_qty,
            supplier,
            category,
            price,
            options,
            min_stock,
            ai_enabled
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          body.name,
          body.home_qty || 0,
          body.store_qty || 0,
          body.supplier || "미지정",
          body.category || "SUSHI",
          body.price || 5,
          JSON.stringify(body.options || []),
          body.min_stock || 15,
          body.ai_enabled ? 1 : 0
        )
        .run();

      return Response.json({
        success:true
      });
    }

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
      success:false
    });

  }catch(e){

    return Response.json({
      success:false,
      error:e.message
    });
  }
}
