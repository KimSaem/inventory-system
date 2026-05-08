export function aiOrderCalculator(item){

  const total =
    Number(item.home_qty || 0) +
    Number(item.store_qty || 0);

  // 안전 재고
  const safeStock = 15;

  // 판매 예측 계수
  const demandFactor = 1.3;

  let recommended =
    Math.ceil((safeStock - total) * demandFactor);

  if(recommended < 0){
    recommended = 0;
  }

  // 최소 발주량
  if(recommended > 0 && recommended < 3){
    recommended = 3;
  }

  return recommended;
}
