import { createDB } from "../db/client.js";

export async function onRequest(context){

  const db = createDB(context.env);

  const todaySales =
    await db
      .prepare(`
        SELECT
          COALESCE(SUM(total_price),0)
          as total
        FROM sales
        WHERE date(created_at)
          = date('now')
      `)
      .all();

  const totalOrders =
    await db
      .prepare(`
        SELECT COUNT(*) as count
        FROM sales
        WHERE date(created_at)
          = date('now')
      `)
      .all();

  const topItems =
    await db
      .prepare(`
        SELECT
          menu_name,
          SUM(qty) as qty
        FROM sales
        GROUP BY menu_name
        ORDER BY qty DESC
        LIMIT 10
      `)
      .all();

  return Response.json({
    success:true,
    data:{
      sales:
        todaySales.results[0]?.total || 0,

      orders:
        totalOrders.results[0]?.count || 0,

      top_items:
        topItems.results || []
    }
  });
}
