export async function onRequest(context) {
  const db = context.env.DB;
  const { request } = context;

  if (request.method === "GET") {
    const { results } = await db.prepare("SELECT * FROM items").all();
    return Response.json(results);
  }

  if (request.method === "POST") {
    const { name } = await request.json();

    await db.prepare("INSERT INTO items (name) VALUES (?)")
      .bind(name)
      .run();

    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
}
