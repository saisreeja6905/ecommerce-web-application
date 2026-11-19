const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to retrieve or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalPrice: 0,
    });
  }
  return cart;
};

// @desc    Get user's shopping cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price comparePrice images brand stockCount isActive',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    // Filter out items where product may have been deleted or deactivated
    const initialCount = cart.items.length;
    cart.items = cart.items.filter((item) => item.product && item.product.isActive);

    if (cart.items.length !== initialCount) {
      cart.calculateTotal();
      await cart.save();
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or currently unavailable',
      });
    }

    if (product.stockCount < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockCount} units available in inventory.`,
      });
    }

    const cart = await getOrCreateCart(req.user._id);

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stockCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You already have ${cart.items[existingIndex].quantity} in cart, and stock is ${product.stockCount}.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        quantity: Number(quantity),
        price: product.price,
      });
    }

    cart.calculateTotal();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price comparePrice images brand stockCount',
    });

    res.json({
      success: true,
      message: 'Item added to shopping cart',
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of an item in cart
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      cart.items.pull(itemId);
      await cart.save();
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists. Removed from cart.',
      });
    }

    if (quantity > product.stockCount) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockCount} units available in stock.`,
      });
    }

    item.quantity = Number(quantity);
    item.price = product.price;

    cart.calculateTotal();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price comparePrice images brand stockCount',
    });

    res.json({
      success: true,
      message: 'Cart item quantity updated',
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req.user._id);

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    cart.calculateTotal();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price comparePrice images brand stockCount',
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear shopping cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
