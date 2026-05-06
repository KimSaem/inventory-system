export async function onRequest(context) {
  const db = context.env.DB;
  const { id, diff } = await context.request.json();

  await db.prepare(
    "UPDATE items SET qty = qty + ? WHERE id = ?"
  ).bind(diff, id).run();

  return Response.json({ success: true });
}
