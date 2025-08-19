import express from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Review from '../models/Review';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all products with filtering, sorting, and pagination
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort = 'createdAt',
      order = 'desc',
      search,
      featured,
      onSale,
      inStock
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = new RegExp(subcategory as string, 'i');
    }

    if (brand) {
      query.brand = new RegExp(brand as string, 'i');
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (onSale === 'true') {
      query.isOnSale = true;
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Build sort object
    const sortObj: any = {};
    if (sort === 'price') {
      sortObj.price = order === 'asc' ? 1 : -1;
    } else if (sort === 'rating') {
      sortObj['rating.average'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'popularity') {
      sortObj.soldCount = -1;
    } else if (sort === 'newest') {
      sortObj.createdAt = -1;
    } else {
      sortObj[sort as string] = order === 'asc' ? 1 : -1;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts: total,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products', 
      error: error.message 
    });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch featured products', 
      error: error.message 
    });
  }
});

// Get trending products
router.get('/trending', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true 
    })
    .populate('category', 'name slug')
    .sort({ soldCount: -1, 'rating.average': -1 })
    .limit(8)
    .lean();

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch trending products', 
      error: error.message 
    });
  }
});

// Get products on sale
router.get('/on-sale', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isOnSale: true 
    })
    .populate('category', 'name slug')
    .sort({ discount: -1 })
    .limit(12)
    .lean();

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch sale products', 
      error: error.message 
    });
  }
});

// Search suggestions
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || (q as string).length < 2) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(q as string, 'i');
    
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: regex },
        { brand: regex },
        { tags: regex }
      ]
    })
    .select('name brand')
    .limit(10)
    .lean();

    const suggestions = products.map(product => ({
      name: product.name,
      brand: product.brand
    }));

    res.json({ suggestions });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch suggestions', 
      error: error.message 
    });
  }
});

// Get single product
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { 
      $inc: { viewCount: 1 } 
    });

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
    .populate('category', 'name slug')
    .limit(4)
    .lean();

    res.json({ 
      product,
      relatedProducts
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch product', 
      error: error.message 
    });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, sort = 'createdAt', order = 'desc' } = req.query;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    const products = await Product.find({ 
      category: categoryId, 
      isActive: true 
    })
    .populate('category', 'name slug')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .lean();

    const total = await Product.countDocuments({ 
      category: categoryId, 
      isActive: true 
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      products,
      category,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch category products', 
      error: error.message 
    });
  }
});

// Get recently viewed products (requires authentication)
router.get('/user/recently-viewed', authenticate, async (req: AuthRequest, res) => {
  try {
    // This would typically be stored in a separate collection or user session
    // For now, return trending products as placeholder
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ viewCount: -1 })
      .limit(6)
      .lean();

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch recently viewed products', 
      error: error.message 
    });
  }
});

export default router;