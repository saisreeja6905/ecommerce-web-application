# ApexStore | Enterprise Full-Stack E-Commerce Platform

ApexStore is an industry-level, production-minded e-commerce web platform engineered with **React.js**, **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, and **Razorpay Sandbox Payment Gateway Integration**.

---

## 🌟 Executive Summary & Architecture

The application adopts a decoupled, modern three-tier web architecture:

- **Client Tier**: React 18 SPA bundled via Vite 6, incorporating Context API for state management, Lucide iconography, accessible semantic HTML5, and a custom CSS design system.
- **API Tier**: Node.js & Express.js RESTful API, secured with Helmet HTTP headers, CORS validation, express-rate-limit protection, bcryptjs password hashing, and express-validator input sanitization.
- **Data Tier**: MongoDB document database modeled with Mongoose ODM, utilizing compound indexes, schema validation hooks, auto-incrementing order numbering, and automated rating aggregations.
- **Payment Verification**: Server-side cryptographic HMAC-SHA256 signature verification for Razorpay test mode, preventing client-side spoofing and unauthorized price manipulation.

---

## 🚀 Key Features

### 🛒 Customer Storefront
1. **Curated Homepage**:
   - Modern responsive navigation bar with instant category links and badge indicators.
   - Live product search bar with autocomplete navigation.
   - Visual departmental category cards (Electronics, Apparel, Home & Kitchen, Books, Fitness, Beauty).
   - Dynamic *Featured* and *Trending* product showcases.
   - Interactive promotional campaigns with voucher indicators.
   - Responsive multi-column footer with policy references.

2. **Catalog & Search**:
   - Multi-facet filtering: Category selection, price range sliders, in-stock availability toggles.
   - Multi-option sorting: Price (Low to High, High to Low), Newest Arrivals, Highest Rated, Popularity.
   - Server-side search over text indexes (name, description, tags, brand).
   - Paginated results display with responsive grid layouts.

3. **Product Details & Social Proof**:
   - Multi-image gallery with high-resolution thumbnail switching.
   - Stock availability status indicators and stock limit validation.
   - Structured key-value technical specifications table.
   - Customer review submission system with 5-star rating selectors and verified buyer tags.
   - Related products carousel based on departmental taxonomy.

4. **Shopping Cart & Wishlist**:
   - Persistent shopping bag with live unit pricing snapshot to prevent client price tampering.
   - Quantity increment/decrement steppers with inventory boundary checks.
   - Automated subtotal, tax (10%), and dynamic free-shipping threshold calculation ($100+).
   - Wishlist toggle on all product cards with one-click transfer to cart.

5. **Checkout & Sandbox Payments**:
   - Multi-field shipping destination form with recipient phone and postal validation.
   - **Razorpay Test Sandbox Integration**:
     - Interactive modal simulation with live INR/USD currency conversion.
     - Server-side cryptographic HMAC-SHA256 signature verification (`order_id + '|' + payment_id`).
     - Rejection of tampered signatures.
   - **Card Sandbox Integration**: Simulated instant authorization for development verification.
   - **Cash on Delivery (COD)** mode.
   - Order confirmation screen with tracking reference numbers and printable item summaries.

6. **Customer Dashboard**:
   - Profile management: Update full name, phone number, and default delivery destination.
   - Credential security: Change password with verification of old password.
   - Chronological order history with colored status badges (Pending, Processing, Shipped, Delivered, Cancelled).
   - Live order detail views with fulfillment timelines and self-service cancellation for pending orders.

### 🛡️ Administrative Dashboard
- **Role-Based Access Control (RBAC)**: Dedicated `/admin` route tree guarded by JWT role verification.
- **Operational Metrics**: Real-time aggregated statistics calculated from database records:
  - Total gross revenue settled
  - Total customer orders fulfilled
  - Catalog inventory count
  - Registered customer accounts
- **Product Management**: Full CRUD operations with title, description, price, compare price, inventory count, SKU, image URLs, specifications, and featured/trending tags.
- **Department Management**: Add, update, and delete product categories.
- **Order Fulfillment Operations**: Real-time queue of all customer orders with status transition controls and custom tracking notes (e.g. FedEx tracking references).
- **Customer Directory**: View all registered customer profiles, emails, phone numbers, and join dates.

---

## 🗄️ Database Schema & Data Models

| Model | Primary Fields | Key Relationships & Indexes |
| :--- | :--- | :--- |
| **User** | `name`, `email`, `password`, `role`, `phone`, `address`, `wishlist` | Unique index on `email`. Bcrypt pre-save hook with salt factor 10. |
| **Category** | `name`, `slug`, `description`, `image`, `productCount` | Unique index on `slug`. Auto-generated URL slugs. |
| **Product** | `name`, `slug`, `price`, `comparePrice`, `category`, `stockCount`, `rating`, `specifications`, `images`, `sku` | Text index on `name`, `description`, `tags`. Unique index on `slug` and `sku`. |
| **Cart** | `user`, `items [{product, quantity, price}]`, `totalPrice` | Unique index on `user`. Price snapshots prevent price manipulation. |
| **Order** | `user`, `orderNumber`, `items`, `shippingAddress`, `paymentMethod`, `paymentStatus`, `status`, `statusHistory`, `totalPrice` | Unique index on `orderNumber` (APX-YYYY-XXXXX format). |
| **Payment** | `order`, `user`, `paymentId`, `amount`, `currency`, `status`, `paymentMethod`, `receiptUrl`, `metadata` | Unique index on `paymentId`. Audit trail for gateway transactions. |
| **Review** | `user`, `product`, `rating`, `title`, `comment`, `isVerified` | Compound unique index on `{user, product}` (one review per product per user). Static hook updates product rating. |
| **Wishlist** | `user`, `products [ref: Product]` | Unique index on `user`. Set deduplication. |

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new customer account.
- `POST /api/auth/login` - Authenticate credentials and issue 7-day JWT token.
- `GET /api/auth/profile` - Retrieve authenticated user profile (Private).
- `PUT /api/auth/profile` - Update name, phone, and delivery address (Private).
- `PUT /api/auth/change-password` - Validate current password and update to new password (Private).

### Products (`/api/products`)
- `GET /api/products` - Search, filter by category/price/stock, sort, and paginate products.
- `GET /api/products/featured` - Retrieve featured products for homepage.
- `GET /api/products/trending` - Retrieve trending products for homepage.
- `GET /api/products/:identifier` - Retrieve product details by slug or ID.
- `GET /api/products/:id/related` - Retrieve products in same department.
- `POST /api/products` - Create catalog product (Admin).
- `PUT /api/products/:id` - Update catalog product (Admin).
- `DELETE /api/products/:id` - Soft or hard delete product (Admin).

### Categories (`/api/categories`)
- `GET /api/categories` - List active categories with item counts.
- `GET /api/categories/:id` - Retrieve category details.
- `POST /api/categories` - Create new department (Admin).
- `PUT /api/categories/:id` - Update category (Admin).
- `DELETE /api/categories/:id` - Delete category (Admin).

### Cart (`/api/cart`)
- `GET /api/cart` - Retrieve user's active bag (Private).
- `POST /api/cart/add` - Add item with inventory validation (Private).
- `PUT /api/cart/items/:itemId` - Update item quantity (Private).
- `DELETE /api/cart/items/:itemId` - Remove item from cart (Private).
- `DELETE /api/cart` - Clear entire cart (Private).

### Payments (`/api/payments`)
- `POST /api/payments/razorpay/create-order` - Create Razorpay order ID with amount in paise (Private).
- `POST /api/payments/razorpay/verify` - Verify cryptographic HMAC-SHA256 signature server-side (Private).
- `POST /api/payments/create-intent` - Create sandbox payment intent (Private).
- `POST /api/payments/confirm` - Verify & confirm sandbox payment (Private).
- `GET /api/payments/order/:orderId` - Get transaction details for order (Private).
- `POST /api/payments/:paymentId/refund` - Process order refund (Admin).

### Orders (`/api/orders`)
- `POST /api/orders` - Place new verified order (Private).
- `GET /api/orders/my-orders` - List customer's chronological orders (Private).
- `GET /api/orders/:id` - View order tracking and status history (Private).
- `PUT /api/orders/:id/cancel` - Cancel order if status is pending/processing (Private).
- `GET /api/orders` - List all customer orders with status filters (Admin).
- `PUT /api/orders/:id/status` - Advance order fulfillment state (Admin).

### Admin Operations (`/api/admin`)
- `GET /api/admin/dashboard` - Aggregated live store statistics and recent orders (Admin).
- `GET /api/admin/users` - Paginated customer directory (Admin).

---

## 🛠️ Installation & Local Execution

### Prerequisites
- **Node.js** >= 18.0.0 (Tested on Node.js v24.19.0)
- **npm** >= 9.0.0
- **MongoDB** instance (Local mongod or MongoDB Atlas URI)

### 1. Environment Configuration
Copy environment templates:
```bash
# In backend directory
cp backend/.env.example backend/.env
```
Ensure your `backend/.env` contains your connection credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=supersecret_jwt_key_ecommerce_production_2026_secure_token!
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_ApexStore2026
RAZORPAY_KEY_SECRET=rzp_test_secret_ApexStore2026
RAZORPAY_CURRENCY=INR
```

### 2. Backend Setup & Database Seeding
```bash
cd backend
npm install
node seeds/seed.js
npm run dev
# Server will listen on http://localhost:5000
```

### 3. Frontend Setup & Execution
```bash
cd ../frontend
npm install
npm run dev
# Frontend will be live on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123` | Full access to catalog CRUD, categories, order fulfillment, analytics |
| **Customer** | `john@example.com` | `Customer@123` | Store browsing, cart, wishlist, checkout, orders, profile |

*(One-click demo buttons are provided on the Login page for rapid evaluation)*

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Bcrypt with auto-generated salts on pre-save hooks.
- **JWT Authorization**: Signed bearer tokens with automated expiration.
- **Cryptographic Payment Verification**: HMAC-SHA256 signature verification executed exclusively on the backend.
- **Price Manipulation Defense**: Item prices are dynamically resolved from the database during order creation, ignoring any modified client-side numbers.
- **Rate Limiting**: IP-based rate limiting (300 requests / 15 minutes) prevents brute-force credential stuffing and denial of service.
- **Data Validation**: Express-validator sanitization strips malicious script tags from all incoming payloads.
- **Zero Card Retention**: Credit card details are never stored or logged.
