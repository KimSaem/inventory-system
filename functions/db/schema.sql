-- 상품 테이블
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  home_qty INTEGER DEFAULT 0,
  store_qty INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 재고 이동 로그 (핵심)
CREATE TABLE stock_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER,
  from_location TEXT,
  to_location TEXT,
  qty INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 (확장용)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  role TEXT DEFAULT 'staff'
);
