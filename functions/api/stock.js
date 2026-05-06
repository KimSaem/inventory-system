export async function onRequest(context) {
  const db = createDB(context.env);

  const res = await db
    .prepare("SELECT * FROM stock")
    .all();

  return Response.json(res);
}
