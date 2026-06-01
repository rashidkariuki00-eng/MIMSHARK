-- ============================================================
-- Mimshach Household Collection — D1 (SQLite) Database Schema
-- Deploy: npx wrangler d1 execute mimshach-db --file=DATABASE_SCHEMA.sql
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTS  (admin-managed, no seller accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL,
  price           REAL NOT NULL CHECK(price >= 0),
  original_price  REAL,
  image_url       TEXT,
  images          TEXT,   -- JSON array of additional image URLs stored in R2
  stock_quantity  INTEGER NOT NULL DEFAULT 0,
  is_available    INTEGER NOT NULL DEFAULT 1,
  is_featured     INTEGER NOT NULL DEFAULT 0,
  rating          REAL    NOT NULL DEFAULT 0 CHECK(rating BETWEEN 0 AND 5),
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ORDERS  (anonymous customers — name + phone only, no accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  order_number     TEXT UNIQUE NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  subtotal         REAL NOT NULL CHECK(subtotal >= 0),
  delivery_fee     REAL NOT NULL DEFAULT 0,
  total_amount     REAL NOT NULL CHECK(total_amount >= 0),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK(status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  notes            TEXT,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                TEXT PRIMARY KEY,
  order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,
  product_title     TEXT NOT NULL,
  product_image_url TEXT,
  quantity          INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  price_at_purchase REAL NOT NULL CHECK(price_at_purchase >= 0),
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL DEFAULT 'Anonymous',
  rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  review_text   TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available  ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created    ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number       ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone        ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created      ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product     ON product_reviews(product_id);

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
INSERT OR IGNORE INTO categories (id, name, slug, description, sort_order) VALUES
  ('cat-home',      'Home Accessories',  'home-accessories', 'Decorative and functional home accessories',   1),
  ('cat-kitchen',   'Kitchen',           'kitchen',          'Cookware, utensils and kitchen appliances',    2),
  ('cat-outfits',   'Outfits',           'outfits',          'Elegant outfits and everyday fashion',         3),
  ('cat-furniture', 'Furniture',         'furniture',        'Stylish furniture for every room',             4),
  ('cat-bedding',   'Bedding & Curtains','bedding-curtains', 'Bedding sets, pillows and curtains',           5),
  ('cat-decor',     'Decor',             'decor',            'Wall art, rugs, plants and decorative items',  6),
  ('cat-elec',      'Electronics',       'electronics',      'Home electronics and smart appliances',        7);
