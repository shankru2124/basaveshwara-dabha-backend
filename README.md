# 🌿 BASAVESHWARA DABHA – Real-Time Pure Vegetarian Food Ordering Platform

A production-grade, full-stack food ordering platform built specifically for **Basaveshwara Dabha** (dedicated authentic pure vegetarian restaurant). Inspired by the UX and speed of Swiggy and Zomato, featuring real-time bi-directional order synchronization between customers and the kitchen dashboard.

---

## 🏗 System Architecture

The platform consists of **two dedicated frontend interfaces** communicating with **one centralized FastAPI backend** and **one shared MongoDB database**:

```
                                 ┌────────────────────────────────────────┐
                                 │       ONE COMMON FASTAPI BACKEND       │
                                 │     (REST APIs + WebSockets Engine)    │
                                 └──────────────────┬─────────────────────┘
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   │                                                                 │
      ┌────────────▼─────────────┐                                      ┌────────────▼─────────────┐
      │     CUSTOMER WEBSITE     │                                      │   RESTAURANT DASHBOARD   │
      │   (React + TS + Vite)    │                                      │   (React + TS + Vite)    │
      │  Port 5173 / Mobile View │                                      │   Port 5174 / Kitchen    │
      └──────────────────────────┘                                      └──────────────────────────┘
                   │                                                                 │
                   └────────────────────────────────┬────────────────────────────────┘
                                                    │
                                     ┌──────────────▼──────────────┐
                                     │       SHARED DATABASE       │
                                     │  MongoDB / Persistent Store │
                                     └─────────────────────────────┘
```

---

## 🚀 Key Features

### 1. Customer Website (`/customer-frontend` - Port 5173)
* **Zomato/Swiggy-inspired UI:** Warm orange/red accents, clean white cards, green pure veg markers.
* **Pure Vegetarian Guarantee:** Exclusively displays vegetarian delicacies across 9 categories (Breakfast, South Indian, North Indian, Thalis, Rice Items, Veg Biriyani, Snacks, Beverages, Desserts).
* **Live Search & Filtering:** Dynamic instant search by dish name, category, price range, and availability.
* **Interactive Shopping Cart:** Persistent cart in localStorage, itemized pricing, promo coupon application (`WELCOME50`, `DABHA20`, `FLAT100`), delivery/packaging charges, and 5% GST calculation.
* **Checkout & Location Assistance:** Delivery vs. Counter Pickup, auto-detect GPS location simulation, saved address selection, cooking instructions.
* **Payment Gateways:** Razorpay UPI/Card/NetBanking checkout with server-side HMAC signature verification + Cash on Delivery (COD).
* **Real-Time Order Tracking:** Live timeline (Placed ➔ Accepted ➔ Preparing ➔ Ready ➔ Out for Delivery ➔ Delivered) that updates automatically without refreshing, accompanied by Web Audio chime alerts.

### 2. Restaurant Owner Dashboard (`/restaurant-dashboard` - Port 5174)
* **Live Kitchen Orders:** Real-time incoming order notifications with loud audio ringtone and browser notifications.
* **Order Status Progression:** One-click status updates (Accept with prep time selector 15/20/30/45m, Reject with reason, Start Cooking, Mark Ready, Dispatch, Complete).
* **Instant Menu Synchronization:** Add/edit dishes, upload photos, change prices, and toggle **Sold Out / Available** with instant broadcast to all active customers.
* **Category Management:** Create, reorder, and toggle menu categories.
* **Restaurant Controls:** Open/Close store toggle (instantly alerts customers and halts checkout), set minimum order value, delivery fees, packaging fees, and tax rates.
* **Order History & Receipts:** Printable thermal tickets (`window.print()`), searchable by Order ID or phone number.
* **Customer Directory & Analytics:** Lifetime order count, total customer spending, 7-day sales bar chart, payment channel breakdown, and CSV export.

---

## 📂 Project Structure

```
basaveshwara-dabha/
├── backend/
│   ├── app/
│   │   ├── config.py             # App settings and environment variables
│   │   ├── database.py           # MongoDB Motor client with disk fallback
│   │   ├── main.py               # FastAPI application & WebSockets
│   │   ├── seed_data.py          # Auto-seeds authentic menu & admin user
│   │   ├── websocket_manager.py  # Real-time multi-channel broadcasting
│   │   ├── models/               # Pydantic v2 schemas
│   │   ├── routers/              # REST API endpoints (auth, menu, cart, orders, etc.)
│   │   └── utils/                # Security, JWT, Razorpay signatures, serializers
│   ├── tests/
│   │   └── test_api.py           # Automated test suite (Pytest)
│   ├── requirements.txt
│   └── run.py
├── customer-frontend/             # Customer ordering interface (React + Vite + Tailwind)
├── restaurant-dashboard/          # Kitchen & management dashboard (React + Vite + Tailwind)
├── database/                      # Persistent database storage
├── uploads/                       # Food & category uploaded photos
├── .env.example
└── README.md
```

---

## 🔑 Default Credentials

### Restaurant Owner / Admin
* **URL:** `http://localhost:5174` (or `/restaurant/login`)
* **Email:** `admin@basaveshwara.com`
* **Password:** `Admin@123`
* *(A "Fill Demo Admin Credentials" button is provided on the login screen for instant testing)*

### Sample Customer
* **URL:** `http://localhost:5173`
* **Email:** `customer@gmail.com`
* **Password:** `Customer@123`
* *(Guest checkout without mandatory login is also fully supported)*

---

## ⚡ Quick Start Guide

### Step 1: Start the Common Backend
```powershell
cd basaveshwara-dabha/backend
python -m pip install -r requirements.txt
python run.py
```
*Backend runs at:* `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)

### Step 2: Start the Customer Website
```powershell
cd basaveshwara-dabha/customer-frontend
npm install
npm run dev
```
*Customer site runs at:* `http://localhost:5173`

### Step 3: Start the Restaurant Dashboard
```powershell
cd basaveshwara-dabha/restaurant-dashboard
npm install
npm run dev
```
*Restaurant dashboard runs at:* `http://localhost:5174`

---

## 🧪 Testing and Verification

Run the automated backend test suite:
```powershell
cd basaveshwara-dabha/backend
python -m pytest tests/test_api.py -v
```

All 4 critical integration tests verify:
1. System health and database connectivity.
2. Menu retrieval, category navigation, and 100% pure vegetarian verification.
3. Restaurant admin authentication and token security.
4. Complete order lifecycle: price calculation, order placement, restaurant acceptance, and customer live tracking.
