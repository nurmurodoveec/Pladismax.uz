/*
  # Promotions and Audit System

  1. New Tables
    - `promotions` - stores all promotion/discount configurations
      - `id` (uuid, primary key)
      - `name` (text) - promotion name
      - `type` (text) - 'product', 'category', 'global', 'order'
      - `discount_type` (text) - 'percentage', 'fixed'
      - `discount_value` (numeric) - amount or percentage
      - `min_order_amount` (numeric) - minimum order for activation
      - `min_quantity` (integer) - minimum items for activation
      - `start_date` (timestamptz) - promotion start
      - `end_date` (timestamptz) - promotion end
      - `is_active` (boolean) - enabled/disabled
      - `priority` (integer) - for conflict resolution
      - `is_combinable` (boolean) - can combine with others
      - `created_at`, `updated_at`
    
    - `promotion_products` - links promotions to specific products
      - `promotion_id` (uuid, FK)
      - `product_id` (uuid, FK)
    
    - `audit_log` - tracks all important changes
      - `id` (uuid, primary key)
      - `table_name` (text) - affected table
      - `record_id` (uuid) - affected record
      - `action` (text) - 'create', 'update', 'delete', 'unblock', 'block'
      - `old_values` (jsonb) - previous state
      - `new_values` (jsonb) - new state
      - `performed_by` (uuid) - user who made change
      - `reason` (text) - reason for change
      - `created_at`
    
    - `categories` - product categories
      - `id` (uuid, primary key)
      - `name` (text)
      - `is_active` (boolean)
    
    - `promotion_categories` - links promotions to categories
      - `promotion_id` (uuid, FK)
      - `category_id` (uuid, FK)

  2. Table Modifications
    - `products` - add sku, cost_price, category_id, is_deleted
    - `profiles` - add is_deleted, unblocked_at, unblocked_reason

  3. Security
    - Enable RLS on all new tables
    - Add policies for admin access
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('product', 'category', 'global', 'order')),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  min_order_amount numeric DEFAULT 0,
  min_quantity integer DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  is_combinable boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotions"
  ON promotions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view active promotions"
  ON promotions FOR SELECT
  TO authenticated
  USING (is_active = true AND start_date <= now() AND end_date >= now());

-- Promotion-Product link table
CREATE TABLE IF NOT EXISTS promotion_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(promotion_id, product_id)
);

ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotion_products"
  ON promotion_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view promotion_products"
  ON promotion_products FOR SELECT
  TO authenticated
  USING (true);

-- Promotion-Category link table
CREATE TABLE IF NOT EXISTS promotion_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(promotion_id, category_id)
);

ALTER TABLE promotion_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotion_categories"
  ON promotion_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view promotion_categories"
  ON promotion_categories FOR SELECT
  TO authenticated
  USING (true);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  performed_by uuid REFERENCES profiles(id),
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit_log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add new columns to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text UNIQUE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE products ADD COLUMN cost_price numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE products ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'unblocked_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unblocked_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'unblocked_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unblocked_reason text;
  END IF;
END $$;

-- Function to auto-unblock client when debt is zero
CREATE OR REPLACE FUNCTION check_and_unblock_client()
RETURNS TRIGGER AS $$
DECLARE
  total_debt numeric;
  client_blocked boolean;
BEGIN
  -- Calculate total debt for client
  SELECT COALESCE(SUM(debt_amount), 0) INTO total_debt
  FROM orders
  WHERE client_id = NEW.client_id;
  
  -- Check if client is blocked
  SELECT is_blocked INTO client_blocked
  FROM profiles
  WHERE id = NEW.client_id;
  
  -- If debt is zero or negative and client is blocked, unblock them
  IF total_debt <= 0 AND client_blocked = true THEN
    UPDATE profiles
    SET 
      is_blocked = false,
      blocked_until = NULL,
      blocked_reason = NULL,
      unblocked_at = now(),
      unblocked_reason = 'Долг обнулён автоматически'
    WHERE id = NEW.client_id;
    
    -- Log the unblock action
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, reason)
    VALUES (
      'profiles',
      NEW.client_id,
      'auto_unblock',
      jsonb_build_object('is_blocked', true),
      jsonb_build_object('is_blocked', false, 'total_debt', total_debt),
      'Автоматическая разблокировка: долг обнулён'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check debt after order update
DROP TRIGGER IF EXISTS trigger_check_unblock_on_order_update ON orders;
CREATE TRIGGER trigger_check_unblock_on_order_update
  AFTER UPDATE OF debt_amount, status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_and_unblock_client();

-- Trigger to check debt after payment
DROP TRIGGER IF EXISTS trigger_check_unblock_on_payment ON payments;
CREATE TRIGGER trigger_check_unblock_on_payment
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION check_and_unblock_client();

-- Add default category
INSERT INTO categories (name) 
VALUES ('Без категории')
ON CONFLICT DO NOTHING;
