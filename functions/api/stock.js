export async function onRequest(context) {
  const db = context.env.DB;

  const { results } = await db.prepare(`
    SELECT 
      items.id,
      items.name,
      SUM(CASE WHEN location_id = 1 THEN qty ELSE 0 END) AS home_qty,
      SUM(CASE WHEN location_id = 2 THEN qty ELSE 0 END) AS store_qty
    FROM items
    LEFT JOIN stock ON items.id = stock.item_id
    GROUP BY items.id
  `).all();

  return Response.json(results);
}
