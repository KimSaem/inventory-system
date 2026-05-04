
export async function onRequest(context) {
  const db = context.env.DB;

  const { request } = context;
  const method = request.method;

  // 📥 GET (전체 조회)
  if (method === "GET") {
    const { results } = await db.prepare("SELECT * FROM items").all();
    return Response.json(results);
  }

  // ➕ POST (추가)
  if (method === "POST") {
    const { name, qty } = await request.json();
    await db.prepare(
      "INSERT INTO items (name, qty) VALUES (?, ?)"
    ).bind(name, qty).run();

    return Response.json({ success: true });
  }

  // ❌ DELETE (삭제)
  if (method === "DELETE") {
    const { id } = await request.json();
    await db.prepare("DELETE FROM items WHERE id = ?").bind(id).run();

    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
}
