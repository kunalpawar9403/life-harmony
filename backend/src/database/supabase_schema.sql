-- ==============================================================================
-- LIFE HARMONY SUPABASE POSTGRESQL SCHEMA
-- Compatible with Supabase SQL Editor and PostgreSQL 14+
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    subtitle VARCHAR(200),
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2) NULL,
    image VARCHAR(500),
    category VARCHAR(50) NOT NULL CHECK (category IN ('vitamins', 'supplements', 'pick_of_month', 'offer_set')),
    stock INT DEFAULT 100,
    rating NUMERIC(3,2) DEFAULT 5.00,
    is_featured SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- 3. GOALS TABLE (many-to-many catalog tags)
CREATE TABLE IF NOT EXISTS public.goals (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(60) NOT NULL UNIQUE,
    label VARCHAR(80) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_goals_slug ON public.goals(slug);

-- 4. PRODUCT GOALS LINK TABLE
CREATE TABLE IF NOT EXISTS public.product_goals (
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    goal_id BIGINT NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, goal_id)
);
CREATE INDEX IF NOT EXISTS idx_product_goals_goal ON public.product_goals(goal_id);

-- 5. PRODUCT INGREDIENTS TABLE
CREATE TABLE IF NOT EXISTS public.product_ingredients (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    amount VARCHAR(80),
    dv VARCHAR(40),
    sort_order INT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_ingredients_product ON public.product_ingredients(product_id);

-- 6. PRODUCT BENEFITS TABLE
CREATE TABLE IF NOT EXISTS public.product_benefits (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_benefits_product ON public.product_benefits(product_id);

-- 7. PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews(product_id);

-- 8. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    label VARCHAR(80) DEFAULT 'Home',
    line1 VARCHAR(200) NOT NULL,
    line2 VARCHAR(200),
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120),
    zip VARCHAR(30) NOT NULL,
    country VARCHAR(80) DEFAULT 'India',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- 9. CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);

-- 10. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    qty INT NOT NULL DEFAULT 1,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- 11. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_wishlist UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);

-- 12. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'Processing' CHECK (status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
    tracking_number VARCHAR(60),
    estimated_delivery DATE,
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    shipping_method VARCHAR(80) DEFAULT 'Standard',
    -- Shipping address snapshot
    ship_name VARCHAR(120),
    ship_email VARCHAR(180),
    ship_phone VARCHAR(40),
    ship_line1 VARCHAR(200),
    ship_line2 VARCHAR(200),
    ship_city VARCHAR(120),
    ship_state VARCHAR(120),
    ship_zip VARCHAR(30),
    ship_country VARCHAR(80),
    -- Payment metadata
    payment_method VARCHAR(40) DEFAULT 'card',
    payment_brand VARCHAR(40),
    payment_last4 VARCHAR(8),
    payment_name VARCHAR(120),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    payment_status VARCHAR(40) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at);

-- 13. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    name VARCHAR(160) NOT NULL,
    subtitle VARCHAR(200),
    image VARCHAR(500),
    price NUMERIC(10,2) NOT NULL,
    qty INT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 14. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80),
    excerpt TEXT,
    content JSONB,
    image VARCHAR(500),
    read_time VARCHAR(30),
    is_featured SMALLINT DEFAULT 0,
    published_at DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at);

-- ==============================================================================
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
