export async function onRequest(context){

  const db = context.env.DB;

  const res = await db
    .prepare(`
      SELECT * FROM sales
      ORDER BY id DESC
      LIMIT 100
    `)
    .all();

  return Response.json({
    success:true,
    data: res.results || []
  });
}
