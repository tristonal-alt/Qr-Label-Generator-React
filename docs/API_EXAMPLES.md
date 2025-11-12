# Backend API Integration Examples

Complete examples for building a backend API to support the QR Code Label Generator with database persistence.

## Table of Contents

- [Overview](#overview)
- [Tech Stack Options](#tech-stack-options)
- [Node.js + Express Setup](#nodejs--express-setup)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

This guide provides complete backend implementation examples using Node.js and Express with PostgreSQL, MySQL, or SQLite.

### Features

- RESTful API endpoints
- Database connectivity
- Input validation
- Error handling
- JWT authentication
- CORS configuration
- API documentation

## Tech Stack Options

### Option 1: Node.js + Express + PostgreSQL
Best for production, scalability, and complex queries.

### Option 2: Node.js + Express + MySQL
Good for existing MySQL infrastructure.

### Option 3: Node.js + Express + SQLite
Perfect for development and small deployments.

## Node.js + Express Setup

### 1. Initialize Backend Project

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express cors dotenv pg mysql2 sqlite3
npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon

# Install validation and security
npm install express-validator helmet morgan jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

### 2. Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Database configuration
│   ├── controllers/
│   │   ├── products.ts       # Product controllers
│   │   ├── warehouses.ts     # Warehouse controllers
│   │   ├── bins.ts           # Bin controllers
│   │   └── qrHistory.ts      # QR history controllers
│   ├── middleware/
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── errorHandler.ts  # Error handling
│   │   └── validation.ts     # Input validation
│   ├── models/
│   │   ├── Product.ts        # Product model
│   │   ├── Warehouse.ts      # Warehouse model
│   │   ├── Bin.ts            # Bin model
│   │   └── QRHistory.ts      # QR history model
│   ├── routes/
│   │   ├── products.ts       # Product routes
│   │   ├── warehouses.ts     # Warehouse routes
│   │   ├── bins.ts           # Bin routes
│   │   └── qrHistory.ts      # QR history routes
│   ├── services/
│   │   └── database.ts       # Database service
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── index.ts              # Entry point
├── .env                      # Environment variables
├── .env.example              # Example env file
├── tsconfig.json             # TypeScript config
└── package.json
```

### 3. Environment Variables

Create `.env`:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qr_label_db
DB_USER=qr_app_user
DB_PASSWORD=your_secure_password

# Or MySQL
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_PORT=3306

# Or SQLite
# DB_TYPE=sqlite
# DB_PATH=./qr_label.db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

Create `.env.example`:

```bash
PORT=5000
NODE_ENV=development
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qr_label_db
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### 4. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 5. Database Configuration

Create `src/config/database.ts`:

```typescript
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbType = process.env.DB_TYPE || 'postgres';

// PostgreSQL Connection
export const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// MySQL Connection
export const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// SQLite Connection
export const getSqliteDb = async () => {
  return open({
    filename: process.env.DB_PATH || './qr_label.db',
    driver: sqlite3.Database,
  });
};

// Database service selector
export const db = dbType === 'postgres' ? pgPool : dbType === 'mysql' ? mysqlPool : null;

// Test connection
export const testConnection = async () => {
  try {
    if (dbType === 'postgres') {
      const client = await pgPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL connected');
    } else if (dbType === 'mysql') {
      const connection = await mysqlPool.getConnection();
      await connection.query('SELECT 1');
      connection.release();
      console.log('✅ MySQL connected');
    } else if (dbType === 'sqlite') {
      const sqliteDb = await getSqliteDb();
      await sqliteDb.get('SELECT 1');
      console.log('✅ SQLite connected');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
```

### 6. Main Server File

Create `src/index.ts`:

```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import productRoutes from './routes/products';
import warehouseRoutes from './routes/warehouses';
import binRoutes from './routes/bins';
import qrHistoryRoutes from './routes/qrHistory';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/qr-history', qrHistoryRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_TYPE}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

## API Endpoints

### Products Endpoints

Create `src/routes/products.ts`:

```typescript
import express from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getProductByStockCode,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products';
import { validate } from '../middleware/validation';

const router = express.Router();

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:stockCode - Get product by stock code
router.get('/:stockCode', getProductByStockCode);

// POST /api/products - Create new product
router.post(
  '/',
  [
    body('stockCode').trim().notEmpty().withMessage('Stock code is required'),
    body('productName').trim().notEmpty().withMessage('Product name is required'),
    body('productClass').trim().notEmpty().withMessage('Product class is required'),
    validate,
  ],
  createProduct
);

// PUT /api/products/:stockCode - Update product
router.put(
  '/:stockCode',
  [
    body('productName').optional().trim().notEmpty(),
    body('productClass').optional().trim().notEmpty(),
    validate,
  ],
  updateProduct
);

// DELETE /api/products/:stockCode - Delete product
router.delete('/:stockCode', deleteProduct);

export default router;
```

### Products Controller

Create `src/controllers/products.ts`:

```typescript
import { Request, Response } from 'express';
import { pgPool } from '../config/database';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get product by stock code
export const getProductByStockCode = async (req: Request, res: Response) => {
  try {
    const { stockCode } = req.params;
    const result = await pgPool.query(
      'SELECT * FROM products WHERE stock_code = $1',
      [stockCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { stockCode, productName, productClass, description } = req.body;

    const result = await pgPool.query(
      `INSERT INTO products (stock_code, product_name, product_class, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [stockCode, productName, productClass, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating product:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Stock code already exists' });
    }

    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { stockCode } = req.params;
    const { productName, productClass, description } = req.body;

    const result = await pgPool.query(
      `UPDATE products
       SET product_name = COALESCE($1, product_name),
           product_class = COALESCE($2, product_class),
           description = COALESCE($3, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE stock_code = $4
       RETURNING *`,
      [productName, productClass, description, stockCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { stockCode } = req.params;

    const result = await pgPool.query(
      'DELETE FROM products WHERE stock_code = $1 RETURNING *',
      [stockCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
```

### Warehouses Endpoints

Create `src/routes/warehouses.ts`:

```typescript
import express from 'express';
import { body } from 'express-validator';
import {
  getAllWarehouses,
  getWarehouseByCode,
  createWarehouse,
  getWarehouseBins,
} from '../controllers/warehouses';
import { validate } from '../middleware/validation';

const router = express.Router();

router.get('/', getAllWarehouses);
router.get('/:warehouseCode', getWarehouseByCode);
router.get('/:warehouseId/bins', getWarehouseBins);
router.post(
  '/',
  [
    body('warehouseCode').trim().notEmpty(),
    body('warehouseName').trim().notEmpty(),
    validate,
  ],
  createWarehouse
);

export default router;
```

### Warehouses Controller

Create `src/controllers/warehouses.ts`:

```typescript
import { Request, Response } from 'express';
import { pgPool } from '../config/database';

export const getAllWarehouses = async (req: Request, res: Response) => {
  try {
    const result = await pgPool.query('SELECT * FROM warehouses ORDER BY warehouse_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
};

export const getWarehouseByCode = async (req: Request, res: Response) => {
  try {
    const { warehouseCode } = req.params;
    const result = await pgPool.query(
      'SELECT * FROM warehouses WHERE warehouse_code = $1',
      [warehouseCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
};

export const getWarehouseBins = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    const result = await pgPool.query(
      'SELECT * FROM bins WHERE warehouse_id = $1 ORDER BY bin_code',
      [warehouseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bins:', error);
    res.status(500).json({ error: 'Failed to fetch bins' });
  }
};

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { warehouseCode, warehouseName, location, capacity } = req.body;

    const result = await pgPool.query(
      `INSERT INTO warehouses (warehouse_code, warehouse_name, location, capacity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [warehouseCode, warehouseName, location, capacity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating warehouse:', error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Warehouse code already exists' });
    }

    res.status(500).json({ error: 'Failed to create warehouse' });
  }
};
```

### QR History Endpoint

Create `src/routes/qrHistory.ts`:

```typescript
import express from 'express';
import { body } from 'express-validator';
import { createQRHistory, getQRHistory } from '../controllers/qrHistory';
import { validate } from '../middleware/validation';

const router = express.Router();

router.get('/', getQRHistory);
router.post(
  '/',
  [
    body('productId').isInt(),
    body('warehouseId').isInt(),
    body('binId').isInt(),
    body('qrData').trim().notEmpty(),
    validate,
  ],
  createQRHistory
);

export default router;
```

Create `src/controllers/qrHistory.ts`:

```typescript
import { Request, Response } from 'express';
import { pgPool } from '../config/database';

export const createQRHistory = async (req: Request, res: Response) => {
  try {
    const { productId, warehouseId, binId, qrData, generatedBy } = req.body;

    const result = await pgPool.query(
      `INSERT INTO qr_code_history
       (product_id, warehouse_id, bin_id, qr_data, generated_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [productId, warehouseId, binId, qrData, generatedBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving QR history:', error);
    res.status(500).json({ error: 'Failed to save QR history' });
  }
};

export const getQRHistory = async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const result = await pgPool.query(
      `SELECT qh.*, p.stock_code, p.product_name, w.warehouse_code, b.bin_code
       FROM qr_code_history qh
       JOIN products p ON qh.product_id = p.id
       JOIN warehouses w ON qh.warehouse_id = w.id
       JOIN bins b ON qh.bin_id = b.id
       ORDER BY qh.generated_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching QR history:', error);
    res.status(500).json({ error: 'Failed to fetch QR history' });
  }
};
```

## Middleware

### Validation Middleware

Create `src/middleware/validation.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

### Error Handler

Create `src/middleware/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};
```

## Authentication

Create `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

## Package.json Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  }
}
```

## Running the Backend

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Testing

Example test with Jest:

```typescript
import request from 'supertest';
import app from '../src/index';

describe('Products API', () => {
  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        stockCode: 'TEST-001',
        productName: 'Test Product',
        productClass: 'Test',
      });
    expect(res.status).toBe(201);
    expect(res.body.stock_code).toBe('TEST-001');
  });
});
```

## Deployment

See [SETUP.md](../SETUP.md) for deployment instructions.

---

**Last Updated**: 2025-11-12
