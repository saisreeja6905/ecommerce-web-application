const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
      uppercase: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['razorpay', 'stripe', 'card', 'cod', 'mock'],
      default: 'razorpay',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
