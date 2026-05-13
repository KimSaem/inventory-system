import { createDB } from "../db/client.js";

export async function onRequest(context){

  const db = createDB(context.env);
  const method = context.request.method;

  // =========================
  // GET
  // =========================
  if(method === "GET"){

    const res = await db
      .prepare(`
        SELECT *
        FROM pos_menu
        WHERE enabled = 1
        ORDER BY category,name
      `)
      .all();

    return Response.json({
      success:true,
      data: res.results || []
    });
  }

  // =========================
  // POST
  // =========================
  if(method === "POST"){

    const body =
      await context.request.json();

    await db
      .prepare(`
        INSERT INTO pos_menu (
          name,
          category,
          price,
          image
        )
        VALUES (?, ?, ?, ?)
      `)
      .bind(
        body.name,
        body.category,
        body.price,
        body.image || ""
      )
      .run();

    return Response.json({
      success:true
    });
  }

  // =========================
  // PUT
  // =========================
  if(method === "PUT"){

    const body =
      await context.request.json();

    await db
      .prepare(`
        UPDATE pos_menu
        SET
          name = ?,
          category = ?,
          price = ?,
          image = ?
        WHERE id = ?
      `)
      .bind(
        body.name,
        body.category,
        body.price,
        body.image || "",
        body.id
      )
      .run();

    return Response.json({
      success:true
    });
  }

  // =========================
  // DELETE
  // =========================
  if(method === "DELETE"){

    const body =
      await context.request.json();

    await db
      .prepare(`
        UPDATE pos_menu
        SET enabled = 0
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
}
