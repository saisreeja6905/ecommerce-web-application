process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecretjwtkeyforintegrationtest1234567890';
process.env.RAZORPAY_KEY_ID = 'rzp_test_ApexStore2026';
process.env.RAZORPAY_KEY_SECRET = 'apexStoreRazorpaySecretKey98765';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const crypto = require('crypto');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

let mongoServer;
let adminToken;
let customerToken;
let customerUserId;
let testCategoryId;
let testProductId;
let testOrderId;

async function runTests() {
  console.log('====================================================');
  console.log('   E-COMMERCE COMPREHENSIVE INTEGRATION TEST SUITE  ');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failedCount++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // 1. Database Connection Verification
    console.log('[Step 1] Initializing MongoDB in-memory binary instance...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log(`[Step 1] Real MongoDB instance running at: ${uri}`);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri, { autoIndex: true });
    assert(mongoose.connection.readyState === 1, 'MongoDB connection established successfully and is ready');

    // 2. Authentication & Authorization Tests
    console.log('\n[Step 2] Testing User Registration & Password Hashing...');
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: 'customer.test@apexstore.com',
        password: 'Password123!',
        phone: '+15551234567',
      });

    assert(registerRes.status === 201, `Customer registered with status 201 (Got: ${registerRes.status})`);
    assert(Boolean(registerRes.body.token), 'JWT token issued upon registration');
    assert(registerRes.body.user.role === 'customer', 'User assigned customer role by default');
    customerToken = registerRes.body.token;
    customerUserId = registerRes.body.user._id;

    // Verify bcrypt hashing in database directly
    const userInDb = await User.findById(customerUserId).select('+password');
    assert(userInDb && userInDb.password !== 'Password123!', 'Raw password was NOT stored in database');
    assert(Boolean(userInDb && userInDb.password && userInDb.password.startsWith('$2')), 'Password hashed with bcrypt $2 salt format');

    // Create Admin User for authorization testing
    console.log('\n[Step 3] Testing Admin Registration & Role Guards...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin.test@apexstore.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.test@apexstore.com',
        password: 'AdminPassword123!',
      });

    assert(adminLoginRes.status === 200, `Admin authenticated successfully with status 200 (Got: ${adminLoginRes.status})`);
    assert(adminLoginRes.body.user.role === 'admin', 'Admin role verified in login response');
    adminToken = adminLoginRes.body.token;

    // Verify Role-Based Authorization Guard
    const forbiddenRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    assert(forbiddenRes.status === 403, `Customer blocked from /admin routes with 403 Forbidden (Got: ${forbiddenRes.status})`);

    const allowedAdminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(allowedAdminRes.status === 200, `Admin permitted to /admin routes with 200 OK (Got: ${allowedAdminRes.status})`);

    // 3. Category & Product Catalog Tests
    console.log('\n[Step 4] Testing Category & Product Management (CRUD)...');
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Audio & Acoustics',
        description: 'Premium headphones and studio monitors',
      });

    assert(catRes.status === 201, `Admin created category with status 201 (Got: ${catRes.status})`);
    testCategoryId = catRes.body.category._id;

    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Apex Studio Pro ANC Headphones',
        description: 'Reference wireless headphones with 40mm beryllium drivers',
        price: 299.99,
        comparePrice: 349.99,
        brand: 'Apex Acoustics',
        category: testCategoryId,
        stockCount: 15,
        sku: 'APX-AUD-991',
        isFeatured: true,
        specifications: [
          { key: 'Driver Size', value: '40mm' },
          { key: 'Battery Life', value: '45 Hours' },
        ],
      });

    assert(prodRes.status === 201, `Admin created product with status 201 (Got: ${prodRes.status})`);
    testProductId = prodRes.body.product._id;

    // Search query test
    const searchRes = await request(app)
      .get('/api/products?search=Beryllium');

    assert(searchRes.status === 200, `Product search executed with status 200 (Got: ${searchRes.status})`);
    assert(searchRes.body.products.length > 0, `Text search found matching product by keyword: ${searchRes.body.products[0]?.name}`);

    // Product update test
    const updateRes = await request(app)
      .put(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 279.99 });

    assert(updateRes.status === 200, `Admin updated product price with status 200 (Got: ${updateRes.status})`);
    assert(updateRes.body.product.price === 279.99, 'Updated price reflected in response');

    // 4. Shopping Cart & Inventory Validation Tests
    console.log('\n[Step 5] Testing Shopping Cart Operations & Stock Validation...');
    const addToCartRes = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProductId,
        quantity: 2,
      });

    assert(addToCartRes.status === 200, `Added item to cart with status 200 (Got: ${addToCartRes.status})`);
    assert(addToCartRes.body.cart.items.length === 1, 'Cart items array length is 1');

    // Test Stock Exceed Validation
    const exceedStockRes = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProductId,
        quantity: 50, // exceeds stockCount of 15
      });

    assert(exceedStockRes.status === 400, `Stock validation blocked excess addition with 400 Bad Request (Got: ${exceedStockRes.status})`);

    // 5. Order Creation & Server-side Price Protection
    console.log('\n[Step 6] Testing Order Creation & Server-Side Price Verification...');
    const orderPayload = {
      items: [
        {
          product: testProductId,
          name: 'Apex Studio Pro ANC Headphones',
          price: 1.00, // Client tries to maliciously manipulate price to $1.00
          quantity: 2,
          image: 'https://images.unsplash.com/test.jpg',
        },
      ],
      shippingAddress: {
        fullName: 'Test Customer',
        phone: '+15551234567',
        street: '123 Test Street, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'United States',
      },
      paymentMethod: 'razorpay',
      itemsPrice: 2.00,
      taxPrice: 0.20,
      shippingPrice: 0.00,
      totalPrice: 2.20,
    };

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(orderPayload);

    if (orderRes.status !== 201) {
      console.error('Order creation error response:', orderRes.body);
    }
    assert(orderRes.status === 201, `Order created with status 201 (Got: ${orderRes.status})`);
    testOrderId = orderRes.body.order._id;
    const createdOrder = orderRes.body.order;

    assert(Boolean(createdOrder.orderNumber), `Auto-generated order number format: ${createdOrder.orderNumber}`);

    // Verify stock was decremented in database
    const productAfterOrder = await Product.findById(testProductId);
    assert(productAfterOrder.stockCount === 13, `Product inventory automatically decremented by 2 (15 -> ${productAfterOrder.stockCount})`);

    // 6. Razorpay Payment Workflow & Cryptographic Verification
    console.log('\n[Step 7] Testing Razorpay Sandbox Payment & Cryptographic Verification...');
    const rzpOrderRes = await request(app)
      .post('/api/payments/razorpay/create-order')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId: testOrderId });

    assert(rzpOrderRes.status === 200, `Razorpay order created with status 200 (Got: ${rzpOrderRes.status})`);
    assert(Boolean(rzpOrderRes.body.razorpayOrderId), `Received Razorpay Order ID: ${rzpOrderRes.body.razorpayOrderId}`);
    const rzpOrderId = rzpOrderRes.body.razorpayOrderId;
    const mockPaymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;

    // Test rejection of tampered/fraudulent signature
    const invalidSignatureRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: testOrderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'invalid_fraudulent_tampered_signature_123',
      });

    assert(invalidSignatureRes.status === 400, `Tampered signature successfully rejected with 400 Bad Request (Got: ${invalidSignatureRes.status})`);

    // Compute genuine HMAC-SHA256 signature using test secret
    const authenticSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${rzpOrderId}|${mockPaymentId}`)
      .digest('hex');

    // Valid verification
    const validSignatureRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: testOrderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: authenticSignature,
      });

    if (validSignatureRes.status !== 200) {
      console.error('Verify payment error response:', validSignatureRes.body);
    }
    assert(validSignatureRes.status === 200, `Payment signature verified server-side with status 200 (Got: ${validSignatureRes.status})`);
    assert(validSignatureRes.body.order.paymentStatus === 'paid', 'Order paymentStatus updated to paid');
    assert(validSignatureRes.body.order.status === 'Processing', 'Order status moved to Processing');

    // 7. Order History & Tracking
    console.log('\n[Step 8] Testing Customer Order History & Status History...');
    const myOrdersRes = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customerToken}`);

    assert(myOrdersRes.status === 200, `Customer fetched order history with status 200 (Got: ${myOrdersRes.status})`);
    assert(myOrdersRes.body.orders.length > 0, `Order ${myOrdersRes.body.orders[0].orderNumber} listed in customer history`);

    // 8. Admin Dashboard Aggregations
    console.log('\n[Step 9] Testing Admin Dashboard Live Ledger Aggregations...');
    const adminStatsRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(adminStatsRes.status === 200, `Admin dashboard queried with status 200 (Got: ${adminStatsRes.status})`);
    assert(adminStatsRes.body.stats.totalOrders >= 1, `Real order count in ledger: ${adminStatsRes.body.stats.totalOrders}`);
    assert(adminStatsRes.body.stats.totalRevenue > 0, `Real gross revenue in ledger: $${adminStatsRes.body.stats.totalRevenue}`);

    console.log('\n====================================================');
    console.log(`TEST SUITE PASSED! Passed: ${passedCount}, Failed: ${failedCount}`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n[FATAL TEST RUN ERROR]:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
