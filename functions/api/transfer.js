export async function onRequest(context) {
  const db = context.env.DB;
  const { item_id, qty } = await context.request.json();

  // 1. 집 재고 감소
  await db.prepare(`
    UPDATE stock 
    SET qty = qty - ? 
    WHERE item_id = ? AND location_id = 1
  `).bind(qty, item_id).run();

  // 2. 가게 재고 증가
  await db.prepare(`
    UPDATE stock 
    SET qty = qty + ? 
    WHERE item_id = ? AND location_id = 2
  `).bind(qty, item_id).run();

  // 3. 이동 기록 저장
  await db.prepare(`
    INSERT INTO transfers (item_id, from_location, to_location, qty)
    VALUES (?, 1, 2, ?)
  `).bind(item_id, qty).run();

  return Response.json({ success: true });
}
