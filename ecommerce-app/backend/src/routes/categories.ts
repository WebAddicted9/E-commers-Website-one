import express from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('children')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch categories', 
      error: error.message 
    });
  }
});

// Get featured categories
router.get('/featured', async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ sortOrder: 1 })
    .limit(8)
    .lean();

    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch featured categories', 
      error: error.message 
    });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    })
    .populate('children')
    .lean();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch category', 
      error: error.message 
    });
  }
});

export default router;