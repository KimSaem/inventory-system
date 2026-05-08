let AUTO_ORDERS = [];

export async function autoOrder(req) {

  const body = await req.json();

  AUTO_ORDERS.push({
    time: Date.now(),
    orders: body.orders
  });

  return new Response(JSON.stringify({
    success: true
  }));
}
