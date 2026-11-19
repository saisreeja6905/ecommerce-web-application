const Product = require('../models/Product');
const Category = require('../models/Category');

// Utility to generate URL slug from name
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const queryFilter = { isActive: true };

    // Search query
    if (req.query.search) {
      queryFilter.$text = { $search: req.query.search };
    }

    // Category filter
    if (req.query.category) {
      // Support either slug or ObjectId
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        queryFilter.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category });
        if (cat) {
          queryFilter.category = cat._id;
        }
      }
    }

    // Brand filter
    if (req.query.brand) {
      queryFilter.brand = new RegExp(req.query.brand, 'i');
    }

    // Price range filter
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      queryFilter.price = {};
      if (req.query.minPrice !== undefined) {
        queryFilter.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice !== undefined) {
        queryFilter.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Rating filter
    if (req.query.rating) {
      queryFilter.rating = { $gte: Number(req.query.rating) };
    }

    // In-stock only filter
    if (req.query.inStock === 'true') {
      queryFilter.stockCount = { $gt: 0 };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'rating':
          sortOptions = { rating: -1 };
          break;
        case 'reviews':
          sortOptions = { numReviews: -1 };
          break;
        case 'name-asc':
          sortOptions = { name: 1 };
          break;
        case 'newest':
        default:
          sortOptions = { createdAt: -1 };
          break;
      }
    }

    const totalProducts = await Product.countDocuments(queryFilter);
    const products = await Product.find(queryFilter)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: products.length,
      totalProducts,
      page,
      pages: Math.ceil(totalProducts / limit) || 1,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(limit);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await Product.find({ isTrending: true, isActive: true })
      .populate('category', 'name slug')
      .limit(limit);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:identifier
// @access  Public
const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isId = identifier.match(/^[0-9a-fA-F]{24}$/);

    const query = isId ? { _id: identifier } : { slug: identifier };
    const product = await Product.findOne(query)
      .populate('category', 'name slug description')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(4);

    res.json({
      success: true,
      products: related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      images,
      brand,
      price,
      comparePrice,
      category,
      stockCount,
      isFeatured,
      isTrending,
      isActive,
      specifications,
      tags,
      sku,
    } = req.body;

    let slug = generateSlug(name);
    // Ensure slug uniqueness
    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await Product.create({
      name,
      slug,
      description,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      brand,
      price,
      comparePrice: comparePrice || 0,
      category,
      stockCount: stockCount ?? 0,
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      specifications: specifications || [],
      tags: tags || [],
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (req.body.name && req.body.name !== product.name) {
      req.body.slug = generateSlug(req.body.name);
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
