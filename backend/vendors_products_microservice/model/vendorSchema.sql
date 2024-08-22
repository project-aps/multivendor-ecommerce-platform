-------------------Vendors Related-------------------------
-- Vendors Table
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    status TEXT DEFAULT 'pending',
    total_income DECIMAL(10, 2) NOT NULL DEFAULT 0,
    -- status =["pending","approved","suspended"]
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vendor Earnings Table
CREATE TABLE vendor_earnings (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id),
    order_id INT NOT NULL,
    order_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    total_earned DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vendor Withdrawals Table
CREATE TABLE vendor_withdrawals (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-------------------Products Related-------------------------
-- Brands table
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_subcategory_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT unique_subcategory_name_per_category UNIQUE (name, category_id)
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id),
    category_id INT NOT NULL REFERENCES categories(id),
    subcategory_id INT NOT NULL REFERENCES subcategories(id),
    brand_id INT REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    old_price DECIMAL(10, 2),
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    thumbnail_url VARCHAR(255) NOT NULL,
    total_items_sold INT NOT NULL DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT TRUE
);

-- Product Thumbnails Table
CREATE TABLE product_thumbnails (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    thumbnail_url TEXT NOT NULL
);

-- Product Galleries Table
CREATE TABLE product_galleries (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

CREATE INDEX product_search_idx ON products USING gin(
    to_tsvector('english', name || ' ' || description)
);

CREATE INDEX brand_search_idx ON brands USING gin(to_tsvector('english', name));

CREATE INDEX vendor_search_idx ON vendors USING gin(to_tsvector('english', business_name));

-- Function to validate subcategory belongs to the correct category
CREATE
OR REPLACE FUNCTION check_product_subcategory_category_fn() RETURNS TRIGGER AS $ $ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        subcategories sc
    WHERE
        sc.id = NEW.subcategory_id
        AND EXISTS (
            SELECT
                1
            FROM
                categories c
            WHERE
                c.id = sc.category_id
                AND c.id = NEW.category_id
        )
) THEN RAISE EXCEPTION 'Subcategory must belong to the correct category';

END IF;

RETURN NEW;

END;

$ $ LANGUAGE 'plpgsql';

-- Trigger to enforce subcategory check before insert or update on products table
CREATE TRIGGER check_product_subcategory_category_trigger BEFORE
INSERT
    OR
UPDATE
    ON products FOR EACH ROW EXECUTE FUNCTION check_product_subcategory_category_fn();