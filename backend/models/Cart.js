const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total price cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Method to calculate total price
cartSchema.methods.calculateTotal = function () {
  this.totalPrice = this.items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  // Round to two decimal places
  this.totalPrice = Math.round(this.totalPrice * 100) / 100;
  return this.totalPrice;
};

// Calculate total before saving
cartSchema.pre('save', function (next) {
  this.calculateTotal();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
