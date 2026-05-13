-- =========================================
-- POS MENU
-- 판매 메뉴 전용
-- =========================================
CREATE TABLE IF NOT EXISTS pos_menu (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL,

  category TEXT DEFAULT 'NIGIRI',

  price REAL DEFAULT 1.80,

  image TEXT DEFAULT '',

  enabled INTEGER DEFAULT 1,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pos_menu_category
ON pos_menu(category);

-- =========================================
-- SALES
-- 판매 기록
-- =========================================
CREATE TABLE IF NOT EXISTS sales (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  menu_id INTEGER,

  menu_name TEXT,

  category TEXT,

  qty INTEGER DEFAULT 0,

  unit_price REAL DEFAULT 0,

  total_price REAL DEFAULT 0,

  payment_method TEXT DEFAULT 'CARD',

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_created
ON sales(created_at);

CREATE INDEX IF NOT EXISTS idx_sales_menu
ON sales(menu_name);

-- =========================================
-- INVENTORY
-- 재고 ERP 전용
-- =========================================
CREATE TABLE IF NOT EXISTS stock (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL,

  supplier TEXT DEFAULT '',

  category TEXT DEFAULT 'INGREDIENT',

  home_qty INTEGER DEFAULT 0,

  store_qty INTEGER DEFAULT 0,

  min_stock INTEGER DEFAULT 10,

  daily_usage INTEGER DEFAULT 0,

  ai_enabled INTEGER DEFAULT 1,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_name
ON stock(name);

-- =========================================
-- STOCK LOGS
-- 모든 작업 기록
-- =========================================
CREATE TABLE IF NOT EXISTS stock_logs (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  action TEXT,

  item_name TEXT,

  qty INTEGER DEFAULT 0,

  note TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_created
ON stock_logs(created_at);

-- =========================================
-- AI ORDER PREDICTIONS
-- AI 발주 예측
-- =========================================
CREATE TABLE IF NOT EXISTS ai_predictions (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  item_name TEXT,

  predicted_qty INTEGER DEFAULT 0,

  confidence REAL DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- PURCHASE ORDERS
-- 자동 발주
-- =========================================
CREATE TABLE IF NOT EXISTS purchase_orders (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  supplier TEXT,

  item_name TEXT,

  qty INTEGER DEFAULT 0,

  status TEXT DEFAULT 'PENDING',

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- SETTINGS
-- 시스템 설정
-- =========================================
CREATE TABLE IF NOT EXISTS settings (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  setting_key TEXT UNIQUE,

  setting_value TEXT
);

-- =========================================
-- USERS
-- 직원 로그인
-- =========================================
CREATE TABLE IF NOT EXISTS users (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  username TEXT UNIQUE,

  password TEXT,

  role TEXT DEFAULT 'staff',

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- DEFAULT MENU DATA
-- =========================================
INSERT INTO pos_menu (
  name,
  category,
  price
)
SELECT 'Salmon Nigiri', 'NIGIRI', 1.80
WHERE NOT EXISTS (
  SELECT 1 FROM pos_menu
  WHERE name = 'Salmon Nigiri'
);

INSERT INTO pos_menu (
  name,
  category,
  price
)
SELECT 'Tuna Nigiri', 'NIGIRI', 1.80
WHERE NOT EXISTS (
  SELECT 1 FROM pos_menu
  WHERE name = 'Tuna Nigiri'
);

INSERT INTO pos_menu (
  name,
  category,
  price
)
SELECT 'Chicken Roll', 'ROLL', 2.50
WHERE NOT EXISTS (
  SELECT 1 FROM pos_menu
  WHERE name = 'Chicken Roll'
);

INSERT INTO pos_menu (
  name,
  category,
  price
)
SELECT 'Teriyaki Donburi', 'DONBURI', 14.90
WHERE NOT EXISTS (
  SELECT 1 FROM pos_menu
  WHERE name = 'Teriyaki Donburi'
);

INSERT INTO pos_menu (
  name,
  category,
  price
)
SELECT 'Coke', 'DRINK', 3.50
WHERE NOT EXISTS (
  SELECT 1 FROM pos_menu
  WHERE name = 'Coke'
);

-- =========================================
-- DEFAULT ADMIN
-- =========================================
INSERT INTO users (
  username,
  password,
  role
)
SELECT 'admin', 'admin123', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users
  WHERE username = 'admin'
);
