# PROJECT DOCUMENTATION
## APEX WHOLESALE & DISTRIBUTION ERP / CRM SYSTEM

---

### TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Project Architecture & Technology Stack](#2-project-architecture--technology-stack)
3. [Role-Based Access Control (RBAC)](#3-role-based-access-control-rbac)
4. [Core Modules & Functional Features](#4-core-modules--functional-features)
5. [Database Schema & Data Models](#5-database-schema--data-models)
6. [API Endpoint Specifications](#6-api-endpoint-specifications)
7. [Automated Inventory Triggers & Business Logic](#7-automated-inventory-triggers--business-logic)
8. [Deployment & Infrastructure Setup](#8-deployment--infrastructure-setup)
9. [Security, Performance & Best Practices](#9-security-performance--best-practices)

---

### 1. EXECUTIVE SUMMARY

#### 1.1 Overview
The **Apex Wholesale & Distribution ERP / CRM System** is an enterprise-grade full-stack web application designed for B2B wholesale distributors, manufacturers, and supply chain enterprises. The platform unifies inventory tracking, customer relationships, procurement, sales dispatches, and financial invoicing into a single, high-contrast, real-time operating dashboard.

#### 1.2 Business Objectives
* **Inventory Visibility**: Eliminate stockouts and overstocking with real-time stock level monitoring and automated reorder alerts.
* **Streamlined Operations**: Automate stock increments on purchase order receipts and stock decrements on delivery dispatches.
* **Financial Integrity**: Track receivables, issue formal billing invoices, and record multi-channel payments.
* **Role-Based Security**: Restrict system actions based on corporate roles (Admin, Sales, Warehouse, Accounts).

---

### 2. PROJECT ARCHITECTURE & TECHNOLOGY STACK

The system is built on a decoupled **Client-Server Architecture** communicating via RESTful JSON APIs.

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 18 (Vite SPA)                      │
│        High-Contrast Utilitarian Enterprise UI Layer        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API (Axios)
┌──────────────────────────────▼──────────────────────────────┐
│                    NODE.JS / EXPRESS.JS                     │
│         RESTful API Server & JWT Auth Middleware            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM
┌──────────────────────────────▼──────────────────────────────┐
│                    MONGODB ATLAS CLOUD                      │
│             NoSQL Multi-Collection Database                 │
└─────────────────────────────────────────────────────────────┘
```

#### 2.1 Technology Stack Details

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 (Vite 5) | Component-driven single-page web application |
| **Styling & Design System**| Tailwind CSS v3 | Utilitarian enterprise styling with high contrast |
| **Icons & UI Assets** | Lucide React | Clean, intuitive status and navigation icons |
| **HTTP Client** | Axios | Intercepted API calls with JWT Bearer tokens |
| **Backend Runtime** | Node.js (v22.x) | Asynchronous event-driven server runtime |
| **Web Framework** | Express.js (v4.x) | RESTful Routing, Middleware, and CORS handling |
| **Database** | MongoDB Atlas Cloud | Scalable cloud document database |
| **ODM Modeling** | Mongoose (v8.x) | Schema definitions, validations, and hooks |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs | Stateless authorization & encrypted password hashing |
| **Production Hosting** | Render (API) & Vercel (UI) | Free tier cloud deployment with auto CI/CD |

---

### 3. ROLE-BASED ACCESS CONTROL (RBAC)

The application enforces strict **Role-Based Access Control (RBAC)** across both frontend route guards and backend endpoint middlewares.

| Role | Access Level | Permitted Operations |
|---|---|---|
| **Admin** | Full Access | Complete control over Dashboard, Customers, Products, POs, Challans, and Invoices. |
| **Sales** | Sales & CRM | Manage Customer Accounts, log CRM interactions, create & dispatch Delivery Challans. |
| **Warehouse** | Inventory & POs | Manage Product Master, monitor low stock, create & receive Supplier Purchase Orders. |
| **Accounts** | Billing & Finance | View completed dispatches, generate billing invoices, record payments, and track receivables. |

---

### 4. CORE MODULES & FUNCTIONAL FEATURES

#### 4.1 Executive Dashboard
* **Real-Time KPI Cards**: Total Revenue Collected, Pending Receivables, Low Stock Count, Active CRM Actions, Dispatched Challans, and Open POs.
* **Low Stock Warning Table**: Instant visibility into items falling below minimum reorder thresholds.
* **Recent Financial Activity**: Live feed of latest invoices and payment statuses.

#### 4.2 Product & Inventory Master
* Catalog management for SKUs, Product Names, Categories, Measurement Units, Purchase Prices, and Selling Prices.
* Instant search and category filtering.
* Visual indicators for optimal vs. low stock levels.

#### 4.3 Customer CRM & Sales Logs
* Directory of corporate customer accounts, contact details, and assigned credit limits.
* Customer interaction history drawer to log sales discussions, action items, and next follow-up dates.
* Status toggles for pending vs. completed sales actions.

#### 4.4 Procurement & Purchase Orders (Inbound Stock)
* Purchase order creation linked to suppliers with line-item pricing and quantities.
* PO Status Workflow: `Draft` ➔ `Ordered` ➔ `Received`.
* **Stock Automation**: Marking PO as `Received` automatically **increments (adds) product warehouse stock**.

#### 4.5 Delivery Challans (Outbound Stock)
* Dispatch management for outbound goods linked to customer accounts.
* **Stock Automation**: Creating a `Dispatched` challan checks stock availability and **decrements (subtracts) product warehouse stock**.
* Status Workflow: `Dispatched` ➔ `Delivered` ➔ `Invoiced`.

#### 4.6 Invoices & Billing Management
* Invoice generation linked to Delivery Challans or standalone sales.
* Payment recording modal (Bank Transfer, Cheque, UPI, Cash, Credit Card).
* Automatic calculation of subtotal, amount paid, and remaining balance due.
* **Printable Invoice Engine**: Clean print stylesheet for generating physical receipts or saving PDF documents.

---

### 5. DATABASE SCHEMA & DATA MODELS

#### 5.1 User Model (`User`)
* `name` (String, Required)
* `email` (String, Unique, Required)
* `password` (String, Encrypted with bcrypt)
* `role` (Enum: `Admin`, `Sales`, `Warehouse`, `Accounts`)

#### 5.2 Product Model (`Product`)
* `sku` (String, Unique, Required, Uppercase)
* `name` (String, Required)
* `category` (String, Required)
* `unit` (String, Default: `pcs`)
* `purchasePrice` (Number, Required)
* `sellingPrice` (Number, Required)
* `currentStock` (Number, Default: `0`)
* `minReorderLevel` (Number, Default: `10`)

#### 5.3 Customer Model (`Customer`)
* `companyName` (String, Required)
* `contactPerson` (String, Required)
* `email` (String)
* `phone` (String)
* `address` (String)
* `creditLimit` (Number, Default: `10000`)
* `followUps`: Array of `{ salesRepId, date, notes, nextFollowUpDate, status }`

#### 5.4 Purchase Order Model (`PurchaseOrder`)
* `poNumber` (String, Unique, Auto-generated: `PO-XXXXX`)
* `supplierName` (String, Required)
* `items`: Array of `{ productId, quantity, unitPrice, amount }`
* `totalAmount` (Number, Required)
* `status` (Enum: `Draft`, `Ordered`, `Received`)
* `orderDate` (Date, Default: `Date.now`)

#### 5.5 Delivery Challan Model (`DeliveryChallan`)
* `challanNumber` (String, Unique, Auto-generated: `DC-XXXXX`)
* `customerId` (Ref: `Customer`, Required)
* `items`: Array of `{ productId, quantity, unitPrice, amount }`
* `totalAmount` (Number, Required)
* `status` (Enum: `Dispatched`, `Delivered`, `Invoiced`)
* `dispatchDate` (Date, Default: `Date.now`)

#### 5.6 Invoice Model (`Invoice`)
* `invoiceNumber` (String, Unique, Auto-generated: `INV-XXXXX`)
* `customerId` (Ref: `Customer`, Required)
* `challanId` (Ref: `DeliveryChallan`, Optional)
* `items`: Array of `{ productId, name, quantity, unitPrice, amount }`
* `totalAmount` (Number, Required)
* `amountPaid` (Number, Default: `0`)
* `paymentStatus` (Enum: `Unpaid`, `Partial`, `Paid`)
* `dueDate` (Date)
* `paymentLogs`: Array of `{ amount, paymentMethod, paymentDate, notes }`

---

### 6. API ENDPOINT SPECIFICATIONS

#### 6.1 Authentication Routes (`/api/auth`)
* `POST /api/auth/register` — Self-register new user account (Public)
* `POST /api/auth/login` — Authenticate user & return JWT token (Public)
* `GET /api/auth/me` — Fetch current logged-in user profile (Protected)

#### 6.2 Executive Dashboard Routes (`/api/dashboard`)
* `GET /api/dashboard/stats` — Fetch aggregate revenue, low stock counts, and pending actions (Protected)

#### 6.3 Product Routes (`/api/products`)
* `GET /api/products` — List all products with search & low stock filters (Protected)
* `POST /api/products` — Create new SKU (Admin, Warehouse)
* `PUT /api/products/:id` — Update existing product details (Admin, Warehouse)
* `DELETE /api/products/:id` — Remove product SKU (Admin, Warehouse)

#### 6.4 Customer Routes (`/api/customers`)
* `GET /api/customers` — List all customer accounts (Admin, Sales)
* `POST /api/customers` — Create new customer account (Admin, Sales)
* `POST /api/customers/:id/follow-ups` — Add CRM sales interaction log (Admin, Sales)
* `PUT /api/customers/:id/follow-ups/:followUpId` — Update CRM log status (Admin, Sales)

#### 6.5 Purchase Order Routes (`/api/purchase-orders`)
* `GET /api/purchase-orders` — List purchase orders (Admin, Warehouse)
* `POST /api/purchase-orders` — Create new draft PO (Admin, Warehouse)
* `PUT /api/purchase-orders/:id/status` — Update PO status (Admin, Warehouse)  
  *(Transitioning to `Received` automatically triggers stock increment)*

#### 6.6 Delivery Challan Routes (`/api/challans`)
* `GET /api/challans` — List outbound dispatches (Admin, Sales, Warehouse)
* `POST /api/challans` — Create & dispatch delivery challan (Admin, Sales, Warehouse)  
  *(Automatically validates stock & decrements inventory)*
* `PUT /api/challans/:id/status` — Update dispatch status (Admin, Sales, Warehouse)

#### 6.7 Invoice Routes (`/api/invoices`)
* `GET /api/invoices` — List financial invoices (Admin, Accounts)
* `POST /api/invoices` — Issue new billing invoice (Admin, Accounts)
* `POST /api/invoices/:id/pay` — Record customer payment entry (Admin, Accounts)

---

### 7. AUTOMATED INVENTORY TRIGGERS & BUSINESS LOGIC

#### 7.1 Goods Receipt Trigger (Inbound)
When a Purchase Order status is updated to `Received`:
1. The backend iterates through all line items in the PO.
2. For each product, `Product.findByIdAndUpdate(productId, { $inc: { currentStock: quantity } })` is executed.
3. Inventory is automatically updated across the platform in real time.

#### 7.2 Delivery Dispatch Trigger (Outbound)
When a Delivery Challan is created with status `Dispatched`:
1. The backend verifies that `currentStock >= quantity` for every requested product.
2. If stock is insufficient, the transaction is blocked with an HTTP 400 error message specifying the exact stock deficit.
3. If stock is available, `Product.findByIdAndUpdate(productId, { $inc: { currentStock: -quantity } })` is executed.

---

### 8. DEPLOYMENT & INFRASTRUCTURE SETUP

#### 8.1 Environment Variables Setup (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/wholesale_erp?retryWrites=true&w=majority
JWT_SECRET=super_secret_wholesale_erp_jwt_key_2026
CLIENT_URL=https://full-stack-web-bice.vercel.app
```

#### 8.2 Live Deployment Links
* **Live Frontend UI (Vercel)**: `https://full-stack-web-bice.vercel.app`
* **Live Backend API (Render)**: `https://wholesale-erp-api.onrender.com/api`
* **Cloud Database (MongoDB Atlas)**: Hosted M0 Cluster with URI URL-encoding support (`%40` for `@` in credentials).

---

### 9. SECURITY, PERFORMANCE & BEST PRACTICES

1. **Password Security**: All user passwords are encrypted using bcrypt salt rounds before database persistence.
2. **Stateless Authentication**: Session state is managed via signed JWT tokens with automatic expiry and bearer header validation.
3. **High-Contrast Utilitarian Design System**: Pure neutral slate/zinc palette (`bg-zinc-50` canvas, `bg-white` cards, `text-zinc-900` headers) ensuring maximum readability across all monitors.
4. **Form Pre-selection & Validation**: Auto-preselects valid products and customer IDs in modal workflows to prevent invalid or null database submissions.
