# SQL Database Integration Guide

Complete guide for integrating the QR Code Label Generator with SQL databases to persist and manage inventory data.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [PostgreSQL Setup](#postgresql-setup)
- [MySQL Setup](#mysql-setup)
- [SQLite Setup](#sqlite-setup)
- [Backend API](#backend-api)
- [Frontend Integration](#frontend-integration)
- [Migration Scripts](#migration-scripts)
- [Security Considerations](#security-considerations)

## Overview

This guide shows how to add backend database functionality to store:
- Product information
- QR code generation history
- Warehouse and bin locations
- Inventory tracking

### Architecture

```
Frontend (React) → API (Node.js/Express) → Database (PostgreSQL/MySQL/SQLite)
```

## Database Schema

### Tables

#### 1. Products Table

Stores product and inventory information.

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  stock_code VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_class VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_stock_code (stock_code),
  INDEX idx_product_class (product_class)
);
```

#### 2. Warehouses Table

Stores warehouse information.

```sql
CREATE TABLE warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_code VARCHAR(50) UNIQUE NOT NULL,
  warehouse_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_warehouse_code (warehouse_code)
);
```

#### 3. Bins Table

Stores bin location information.

```sql
CREATE TABLE bins (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_code VARCHAR(50) NOT NULL,
  aisle VARCHAR(10),
  rack VARCHAR(10),
  shelf VARCHAR(10),
  capacity INTEGER,
  occupied_capacity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint
  UNIQUE(warehouse_id, bin_code),

  -- Indexes
  INDEX idx_bin_code (bin_code),
  INDEX idx_warehouse_bin (warehouse_id, bin_code)
);
```

#### 4. Inventory Table

Tracks product locations and quantities.

```sql
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint
  UNIQUE(product_id, warehouse_id, bin_id),

  -- Indexes
  INDEX idx_product_location (product_id, warehouse_id, bin_id)
);
```

#### 5. QR Code History Table

Tracks generated QR codes for auditing.

```sql
CREATE TABLE qr_code_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
  qr_data TEXT NOT NULL,
  generated_by VARCHAR(100),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  print_count INTEGER DEFAULT 0,
  last_printed TIMESTAMP,

  -- Indexes
  INDEX idx_generated_at (generated_at),
  INDEX idx_product_qr (product_id)
);
```

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  Products   │       │  Warehouses  │       │    Bins     │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id          │       │ id           │       │ id          │
│ stock_code  │       │ warehouse_code│◄──────│ warehouse_id│
│ product_name│       │ warehouse_name│       │ bin_code    │
│ product_class│      │ location     │       │ aisle       │
└──────┬──────┘       └──────────────┘       └──────┬──────┘
       │                                             │
       │              ┌──────────────┐              │
       └──────────────► Inventory    ◄──────────────┘
                      ├──────────────┤
                      │ id           │
                      │ product_id   │
                      │ warehouse_id │
                      │ bin_id       │
                      │ quantity     │
                      └──────────────┘
```

## PostgreSQL Setup

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql@15

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS
```

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# In PostgreSQL shell
CREATE DATABASE qr_label_db;
CREATE USER qr_app_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE qr_label_db TO qr_app_user;

# Exit
\q
```

### 3. Run Migration Script

```bash
# Connect to the database
psql -U qr_app_user -d qr_label_db

# Run migration script
\i migrations/001_initial_schema.sql
```

Create `migrations/001_initial_schema.sql`:

```sql
-- PostgreSQL Migration Script

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  stock_code VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_class VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_stock_code ON products(stock_code);
CREATE INDEX idx_products_class ON products(product_class);

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_code VARCHAR(50) UNIQUE NOT NULL,
  warehouse_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouses_code ON warehouses(warehouse_code);

-- Create bins table
CREATE TABLE IF NOT EXISTS bins (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_code VARCHAR(50) NOT NULL,
  aisle VARCHAR(10),
  rack VARCHAR(10),
  shelf VARCHAR(10),
  capacity INTEGER,
  occupied_capacity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(warehouse_id, bin_code)
);

CREATE INDEX idx_bins_code ON bins(bin_code);
CREATE INDEX idx_bins_warehouse ON bins(warehouse_id, bin_code);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id, bin_id)
);

CREATE INDEX idx_inventory_location ON inventory(product_id, warehouse_id, bin_id);

-- Create qr_code_history table
CREATE TABLE IF NOT EXISTS qr_code_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
  qr_data TEXT NOT NULL,
  generated_by VARCHAR(100),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  print_count INTEGER DEFAULT 0,
  last_printed TIMESTAMP
);

CREATE INDEX idx_qr_generated_at ON qr_code_history(generated_at);
CREATE INDEX idx_qr_product ON qr_code_history(product_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO products (stock_code, product_name, product_class, description) VALUES
  ('TEST-SKU-001', 'Sample Product 1', 'Electronics', 'Test product for electronics'),
  ('TEST-SKU-002', 'Sample Product 2', 'Hardware', 'Test product for hardware'),
  ('TEST-SKU-003', 'Sample Product 3', 'Software', 'Test product for software');

INSERT INTO warehouses (warehouse_code, warehouse_name, location, capacity) VALUES
  ('MAIN-WH', 'Main Warehouse', 'Building A, Floor 1', 10000),
  ('SEC-WH', 'Secondary Warehouse', 'Building B, Floor 2', 5000);

INSERT INTO bins (warehouse_id, bin_code, aisle, rack, shelf, capacity) VALUES
  (1, 'A1-R2-S3', 'A1', 'R2', 'S3', 100),
  (1, 'A1-R2-S4', 'A1', 'R2', 'S4', 100),
  (2, 'B1-R1-S1', 'B1', 'R1', 'S1', 150);

INSERT INTO inventory (product_id, warehouse_id, bin_id, quantity) VALUES
  (1, 1, 1, 50),
  (2, 1, 2, 75),
  (3, 2, 3, 100);
```

## MySQL Setup

### 1. Install MySQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server

# macOS (Homebrew)
brew install mysql

# Start MySQL
sudo systemctl start mysql  # Linux
brew services start mysql  # macOS
```

### 2. Create Database

```bash
# Connect to MySQL
sudo mysql -u root -p

# In MySQL shell
CREATE DATABASE qr_label_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'qr_app_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON qr_label_db.* TO 'qr_app_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### 3. MySQL Migration Script

Create `migrations/001_initial_schema_mysql.sql`:

```sql
-- MySQL Migration Script

USE qr_label_db;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_code VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_class VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stock_code (stock_code),
  INDEX idx_product_class (product_class)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_code VARCHAR(50) UNIQUE NOT NULL,
  warehouse_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_warehouse_code (warehouse_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create bins table
CREATE TABLE IF NOT EXISTS bins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id INT NOT NULL,
  bin_code VARCHAR(50) NOT NULL,
  aisle VARCHAR(10),
  rack VARCHAR(10),
  shelf VARCHAR(10),
  capacity INT,
  occupied_capacity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_warehouse_bin (warehouse_id, bin_code),
  INDEX idx_bin_code (bin_code),
  INDEX idx_warehouse_bin (warehouse_id, bin_code),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  bin_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_inventory (product_id, warehouse_id, bin_id),
  INDEX idx_product_location (product_id, warehouse_id, bin_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create qr_code_history table
CREATE TABLE IF NOT EXISTS qr_code_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  bin_id INT NOT NULL,
  qr_data TEXT NOT NULL,
  generated_by VARCHAR(100),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  print_count INT DEFAULT 0,
  last_printed TIMESTAMP NULL,
  INDEX idx_generated_at (generated_at),
  INDEX idx_product_qr (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO products (stock_code, product_name, product_class, description) VALUES
  ('TEST-SKU-001', 'Sample Product 1', 'Electronics', 'Test product for electronics'),
  ('TEST-SKU-002', 'Sample Product 2', 'Hardware', 'Test product for hardware');

INSERT INTO warehouses (warehouse_code, warehouse_name, location, capacity) VALUES
  ('MAIN-WH', 'Main Warehouse', 'Building A, Floor 1', 10000);

INSERT INTO bins (warehouse_id, bin_code, aisle, rack, shelf, capacity) VALUES
  (1, 'A1-R2-S3', 'A1', 'R2', 'S3', 100);

INSERT INTO inventory (product_id, warehouse_id, bin_id, quantity) VALUES
  (1, 1, 1, 50);
```

Run migration:
```bash
mysql -u qr_app_user -p qr_label_db < migrations/001_initial_schema_mysql.sql
```

## SQLite Setup

SQLite is great for development and small deployments.

### 1. Install SQLite

```bash
# Ubuntu/Debian
sudo apt-get install sqlite3

# macOS (usually pre-installed)
brew install sqlite
```

### 2. Create Database

```bash
# Create database file
sqlite3 qr_label.db
```

### 3. SQLite Migration Script

Create `migrations/001_initial_schema_sqlite.sql`:

```sql
-- SQLite Migration Script

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_code TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  product_class TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_stock_code ON products(stock_code);
CREATE INDEX IF NOT EXISTS idx_products_class ON products(product_class);

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  warehouse_code TEXT UNIQUE NOT NULL,
  warehouse_name TEXT NOT NULL,
  location TEXT,
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(warehouse_code);

-- Create bins table
CREATE TABLE IF NOT EXISTS bins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  warehouse_id INTEGER NOT NULL,
  bin_code TEXT NOT NULL,
  aisle TEXT,
  rack TEXT,
  shelf TEXT,
  capacity INTEGER,
  occupied_capacity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(warehouse_id, bin_code),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bins_code ON bins(bin_code);
CREATE INDEX IF NOT EXISTS idx_bins_warehouse ON bins(warehouse_id, bin_code);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  warehouse_id INTEGER NOT NULL,
  bin_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id, bin_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(product_id, warehouse_id, bin_id);

-- Create qr_code_history table
CREATE TABLE IF NOT EXISTS qr_code_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  warehouse_id INTEGER NOT NULL,
  bin_id INTEGER NOT NULL,
  qr_data TEXT NOT NULL,
  generated_by TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  print_count INTEGER DEFAULT 0,
  last_printed TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qr_generated_at ON qr_code_history(generated_at);
CREATE INDEX IF NOT EXISTS idx_qr_product ON qr_code_history(product_id);

-- Insert sample data
INSERT INTO products (stock_code, product_name, product_class, description) VALUES
  ('TEST-SKU-001', 'Sample Product 1', 'Electronics', 'Test product'),
  ('TEST-SKU-002', 'Sample Product 2', 'Hardware', 'Test product');

INSERT INTO warehouses (warehouse_code, warehouse_name, location, capacity) VALUES
  ('MAIN-WH', 'Main Warehouse', 'Building A', 10000);

INSERT INTO bins (warehouse_id, bin_code, aisle, rack, shelf, capacity) VALUES
  (1, 'A1-R2-S3', 'A1', 'R2', 'S3', 100);

INSERT INTO inventory (product_id, warehouse_id, bin_id, quantity) VALUES
  (1, 1, 1, 50);
```

Run migration:
```bash
sqlite3 qr_label.db < migrations/001_initial_schema_sqlite.sql
```

## Backend API

See [API_EXAMPLES.md](./API_EXAMPLES.md) for complete backend implementation with:
- Node.js + Express server
- RESTful API endpoints
- Database connection examples
- Authentication/Authorization
- API documentation

## Frontend Integration

### 1. Create API Service

Create `services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: number;
  stockCode: string;
  productName: string;
  productClass: string;
  description?: string;
}

export interface Warehouse {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  location?: string;
}

export interface Bin {
  id: number;
  warehouseId: number;
  binCode: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
}

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

// Get product by stock code
export const getProductByStockCode = async (stockCode: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${stockCode}`);
  if (!response.ok) throw new Error('Product not found');
  return response.json();
};

// Get warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
  const response = await fetch(`${API_BASE_URL}/warehouses`);
  if (!response.ok) throw new Error('Failed to fetch warehouses');
  return response.json();
};

// Get bins for warehouse
export const getBinsByWarehouse = async (warehouseId: number): Promise<Bin[]> => {
  const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/bins`);
  if (!response.ok) throw new Error('Failed to fetch bins');
  return response.json();
};

// Save QR generation history
export const saveQRHistory = async (data: {
  productId: number;
  warehouseId: number;
  binId: number;
  qrData: string;
  generatedBy?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/qr-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to save QR history');
  return response.json();
};
```

### 2. Update App Component

Integrate with backend data:

```typescript
import { useEffect, useState } from 'react';
import { getProducts, getWarehouses, getBinsByWarehouse } from './services/api';

// Add state for dropdowns
const [products, setProducts] = useState<Product[]>([]);
const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
const [bins, setBins] = useState<Bin[]>([]);

// Load data on mount
useEffect(() => {
  const loadData = async () => {
    try {
      const [productsData, warehousesData] = await Promise.all([
        getProducts(),
        getWarehouses(),
      ]);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };
  loadData();
}, []);
```

## Security Considerations

### 1. Environment Variables

Never commit sensitive data. Use `.env` files:

```bash
# .env.local
VITE_API_URL=http://localhost:5000/api
DATABASE_URL=postgresql://user:pass@localhost:5432/qr_label_db
JWT_SECRET=your-secret-key-here
```

### 2. SQL Injection Prevention

Always use parameterized queries:

```typescript
// ✅ Good - Parameterized
const result = await db.query(
  'SELECT * FROM products WHERE stock_code = $1',
  [stockCode]
);

// ❌ Bad - SQL Injection risk
const result = await db.query(
  `SELECT * FROM products WHERE stock_code = '${stockCode}'`
);
```

### 3. Authentication

Implement JWT or session-based authentication for API endpoints.

### 4. Input Validation

Validate all inputs on both frontend and backend.

### 5. Database Backups

Schedule regular backups:

```bash
# PostgreSQL backup
pg_dump -U qr_app_user qr_label_db > backup_$(date +%Y%m%d).sql

# MySQL backup
mysqldump -u qr_app_user -p qr_label_db > backup_$(date +%Y%m%d).sql

# SQLite backup
sqlite3 qr_label.db ".backup backup_$(date +%Y%m%d).db"
```

## Next Steps

1. ✅ Set up your chosen database
2. ✅ Run migration scripts
3. 📖 Read [API_EXAMPLES.md](./API_EXAMPLES.md) for backend implementation
4. 🔐 Implement authentication
5. 🚀 Deploy to production

---

**Last Updated**: 2025-11-12
