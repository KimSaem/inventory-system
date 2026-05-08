export function aiOrderCalculator(item) {

  const total =
    Number(item.home_qty || 0) +
    Number(item.store_qty || 0);

  // 기본 안전재고
  const baseStock = 15;

  // 수요 예측 계수
  const demandFactor = 1.3;

  let recommended =
    Math.ceil((baseStock - total) * demandFactor);

  // 음수 방지
  if(recommended < 0){
    recommended = 0;
  }

  // 최소 발주 수량
  if(recommended > 0 && recommended < 3){
    recommended = 3;
  }

  return recommended;
}
