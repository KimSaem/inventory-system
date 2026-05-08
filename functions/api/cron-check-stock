export async function checkStock(req, env) {

  const res = await fetch(env.API_URL + "/api/stock");
  const json = await res.json();

  const items = json.data || [];

  let alerts = [];
  let orders = [];

  for (let item of items) {

    const total = (item.home_qty || 0) + (item.store_qty || 0);

    // 🔴 재고 부족 알림 기준
    if (total <= 5) {
      alerts.push({
        name: item.name,
        level: "CRITICAL",
        stock: total
      });
    }

    // 🤖 AI 자동 발주 로직 (기본형)
    if (total <= 10) {

      const recommendedOrder = Math.max(10 - total, 5);

      orders.push({
        name: item.name,
        current: total,
        order_qty: recommendedOrder
      });
    }
  }

  // 🔔 알림 전송 (예: webhook)
  if (alerts.length > 0) {
    await fetch(env.WEBHOOK_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        type: "STOCK_ALERT",
        alerts
      })
    });
  }

  // 📦 자동 발주 저장
  if (orders.length > 0) {
    await fetch(env.API_URL + "/api/auto-order", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ orders })
    });
  }

  return new Response(JSON.stringify({
    success: true,
    alerts,
    orders
  }));
}
