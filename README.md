# Wholesale & Distribution ERP / CRM System

A lightweight, production-ready enterprise Wholesale & Distribution ERP/CRM web application designed with high-contrast, utilitarian dashboard aesthetics and real-time inventory automation.

---

## 🌟 Key Features & Business Logic

- **Role-Based Access Control (RBAC)**: Custom JWT authentication supporting 4 enterprise operational roles:
  1. **Admin / Management**: Universal access across all modules.
  2. **Sales Team**: Customer accounts, CRM follow-up logs, and delivery challans.
  3. **Warehouse Team**: Inventory SKU master, low-stock alerts, and purchase orders.
  4. **Accounts Team**: Invoicing, payment collection (`Unpaid`, `Partial`, `Paid`), and financial metrics.
- **Automated Stock Engine**:
  - Receiving a **Purchase Order** (`status: 'Received'`) automatically increments `currentStock` in inventory.
  - Dispatching a **Delivery Challan** (`status: 'Dispatched'`) checks stock availability and automatically decrements `currentStock`.
  - Automatic low stock flags when `currentStock <= minReorderLevel`.
- **CRM Interaction Engine**: Real-time sales log tracking with next follow-up date notifications and status toggling (`Pending`, `Completed`).
- **Billing & Receivable Engine**: Standalone or Challan-linked invoice generation, payment history logging, remaining balance calculation, and printable invoice documents (`#printable-invoice`).
- **Utilitarian Enterprise UI**: High-contrast slate/gray design system built with React, Vite, and Tailwind CSS.

---

## 🏗️ Project Architecture & Directory Structure

```
full stack project company/
├── server/                           # Express.js REST API Backend
│   ├── src/
│   │   ├── config/db.js              # Mongoose MongoDB connection
│   │   ├── middleware/               # Auth & RBAC authorization middleware
│   │   ├── models/                   # Mongoose Schemas (User, Customer, Product, PO, Challan, Invoice)
│   │   ├── controllers/              # REST Controller logic & Stock movement handlers
│   │   ├── routes/                   # API Routes (/api/auth, /api/customers, /api/products, etc.)
│   │   └── app.js                    # Express app initialization with Render health check
│   ├── server.js                     # HTTP Server listener
│   ├── seed.js                       # Database Seeder script
│   ├── package.json
│   └── .env.example
├── client/                           # Vite + React Single-Page Application (SPA)
│   ├── src/
│   │   ├── components/               # Header, Sidebar, ProtectedRoute, Modals
│   │   ├── context/AuthContext.jsx   # Auth state & RBAC permission helpers
│   │   ├── services/api.js           # Axios client with JWT bearer interceptors
│   │   ├── pages/                    # Dashboard, Customers, Products, POs, Challans, Invoices
│   │   ├── index.css                 # Tailwind CSS directives & Enterprise Theme
│   │   └── App.jsx
│   ├── vercel.json                   # Vercel SPA rewrite configuration
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
└── README.md                         # Documentation & Deployment Guide
```

---

## 🚀 Local Development Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/wholesale_erp`) or a free [MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas).

### Step 1: Backend Setup (`server/`)
1. Open terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Update `MONGO_URI` in `server/.env` with your MongoDB connection string (e.g. Atlas URI or local MongoDB).
5. **Seed Demo Data** (pre-configures accounts for all 4 roles, products, customers, POs, challans & invoices):
   ```bash
   npm run seed
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend server will run on `http://localhost:5000`.*

---

### Step 2: Frontend Setup (`client/`)
1. Open a second terminal window and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start Vite development server:
   ```bash
   npm run dev
   ```
   *Access the web app at `http://localhost:5173`.*

---

## 🔑 Demo Account Credentials

When testing locally or on staging, use these credentials pre-loaded by `npm run seed`:

| Role | Email Address | Password | Permissions Summary |
|---|---|---|---|
| **Admin** | `admin@wholesale.com` | `password123` | Full access across all modules |
| **Sales Team** | `sales@wholesale.com` | `password123` | Customers, CRM Follow-ups, Delivery Challans |
| **Warehouse Team** | `warehouse@wholesale.com` | `password123` | Products, Stock Levels, Purchase Orders |
| **Accounts Team** | `accounts@wholesale.com` | `password123` | Invoices, Payment Tracking, Financial Summaries |

---

## ☁️ Deployment Guide

### Deploying Backend to Render (`server/`)

1. **Push Repository to GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
5. Configure Environment Variables in Render:
   - `PORT`: `5000` (or leave default assigned by Render)
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/wholesale_erp?retryWrites=true&w=wide`
   - `JWT_SECRET`: `your_secure_jwt_secret_key_here`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
6. **Health Check Path**: `/` (returns HTTP 200 `{ status: "ok" }`).
7. Click **Create Web Service**. Note your Render service URL (e.g. `https://wholesale-erp-api.onrender.com`).

---

### Deploying Frontend to Vercel (`client/`)

1. Log into [Vercel Dashboard](https://vercel.com/) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL`: `https://wholesale-erp-api.onrender.com/api` (your deployed Render API URL)
5. Click **Deploy**. Vercel will automatically build the React app and deploy it with SPA routing enabled via `client/vercel.json`.

---

## 🔌 API Route Reference

### Auth (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & receive JWT token
- `POST /api/auth/register` - Create user (Admin only)
- `GET /api/auth/me` - Get current user profile

### Customers & CRM (`/api/customers`)
- `GET /api/customers` - List customers (Supports `?search=`)
- `POST /api/customers` - Create customer master account
- `POST /api/customers/:id/follow-ups` - Log CRM sales interaction
- `PUT /api/customers/:id/follow-ups/:followUpId` - Toggle follow-up status (`Pending`/`Completed`)

### Inventory & Products (`/api/products`)
- `GET /api/products` - List products (Supports `?search=`, `?category=`, `?lowStock=true`)
- `GET /api/products/low-stock` - Get low stock warning summary
- `POST /api/products` - Create product SKU
- `PUT /api/products/:id` - Edit product details

### Purchase Orders (`/api/purchase-orders`)
- `GET /api/purchase-orders` - List purchase orders
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/:id/status` - Update status (Setting status to `Received` automatically increments stock)

### Delivery Challans (`/api/challans`)
- `GET /api/challans` - List delivery challans
- `POST /api/challans` - Create & dispatch delivery challan (Automatically checks & decrements stock)

### Invoices & Billing (`/api/invoices`)
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice (standalone or linked to challan)
- `POST /api/invoices/:id/pay` - Record payment & update balance status
