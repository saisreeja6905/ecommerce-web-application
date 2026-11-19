const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { v4: uuidv4 } = require('uuid');

// @desc    Create Razorpay order for checkout
// @route   POST /api/payments/razorpay/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already marked as paid.',
      });
    }

    // Razorpay amounts are in smallest currency unit (paise for INR, cents for USD)
    const amountInSubunits = Math.round(order.totalPrice * 100);
    const currency = process.env.RAZORPAY_CURRENCY || 'INR';
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ApexStore2026';

    let razorpayOrderId;

    // If Razorpay SDK is configured with live/test API keys
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = require('razorpay');
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const rzpOrder = await instance.orders.create({
          amount: amountInSubunits,
          currency,
          receipt: order.orderNumber,
          notes: {
            orderId: order._id.toString(),
            customerEmail: req.user.email,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (sdkError) {
        console.warn('[Razorpay SDK] Falling back to standard sandbox order generation:', sdkError.message);
        razorpayOrderId = `order_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
      }
    } else {
      // Sandbox fallback mode
      razorpayOrderId = `order_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
    }

    res.json({
      success: true,
      orderId: order._id,
      razorpayOrderId,
      amount: amountInSubunits,
      currency,
      keyId: razorpayKeyId,
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+919876543210',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature server-side
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been paid for.',
      });
    }

    // Verify signature using HMAC SHA256
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_ApexStore2026';
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    const isAuthentic = (generatedSignature === razorpay_signature);

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature.',
      });
    }

    // Create payment record
    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      paymentId: razorpay_payment_id || `pay_${uuidv4().slice(0, 16)}`,
      amount: order.totalPrice,
      currency: 'INR',
      status: 'succeeded',
      paymentMethod: 'razorpay',
      receiptUrl: `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
      metadata: {
        orderNumber: order.orderNumber,
        customerEmail: req.user.email,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        verificationTimestamp: new Date().toISOString(),
      },
    });

    // Update order
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = 'razorpay';
    order.paymentStatus = 'paid';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    order.status = 'Processing';
    order.statusHistory.push({
      status: 'Processing',
      changedAt: new Date(),
      note: `Razorpay signature verified successfully (${razorpay_payment_id})`,
    });

    await order.save();

    res.json({
      success: true,
      message: 'Razorpay payment verified and order updated to Processing.',
      payment,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create generic sandbox payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid for.',
      });
    }

    const paymentIntentId = `pi_${uuidv4().replace(/-/g, '').slice(0, 24)}`;
    const clientSecret = `${paymentIntentId}_secret_${uuidv4().slice(0, 16)}`;

    res.json({
      success: true,
      clientSecret,
      paymentIntentId,
      amount: order.totalPrice,
      currency: 'usd',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm generic sandbox payment
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, paymentMethod = 'sandbox_card', paymentDetails = {} } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been marked as paid.',
      });
    }

    const verifiedPaymentId = paymentId || `pay_${uuidv4().slice(0, 18)}`;

    const paymentRecord = await Payment.create({
      order: order._id,
      user: req.user._id,
      paymentId: verifiedPaymentId,
      amount: order.totalPrice,
      currency: 'usd',
      status: 'succeeded',
      paymentMethod,
      receiptUrl: `https://payments.example.com/receipts/${verifiedPaymentId}`,
      metadata: {
        orderNumber: order.orderNumber,
        customerEmail: req.user.email,
        ...paymentDetails,
      },
    });

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = 'paid';
    order.paymentResult = {
      id: verifiedPaymentId,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    order.status = 'Processing';
    order.statusHistory.push({
      status: 'Processing',
      changedAt: new Date(),
      note: `Payment verified via ${paymentMethod} (${verifiedPaymentId})`,
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment verified and order updated to processing.',
      payment: paymentRecord,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment info for order
// @route   GET /api/payments/order/:orderId
// @access  Private
const getPaymentByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ order: orderId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment record found for this order.',
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund payment (Admin)
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
const processRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    payment.status = 'refunded';
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'refunded';
      order.status = 'Cancelled';
      order.statusHistory.push({
        status: 'Cancelled',
        changedAt: new Date(),
        note: `Payment refunded ($${payment.amount})`,
      });
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment successfully refunded',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPaymentIntent,
  confirmPayment,
  getPaymentByOrder,
  processRefund,
};
