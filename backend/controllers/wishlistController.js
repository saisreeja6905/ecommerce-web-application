const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Helper to get or create wishlist
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }
  return wishlist;
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price comparePrice images brand rating numReviews stockCount isActive',
    });

    res.json({
      success: true,
      wishlist: wishlist || { user: req.user._id, products: [] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);

    const alreadyAdded = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (alreadyAdded) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in your wishlist',
      });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price comparePrice images brand rating numReviews stockCount isActive',
    });

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: populatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await getOrCreateWishlist(req.user._id);

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price comparePrice images brand rating numReviews stockCount isActive',
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: populatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
