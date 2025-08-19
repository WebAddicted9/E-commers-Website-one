import express from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply admin authorization to all routes
router.use(authenticate, authorize('admin'));

// Dashboard statistics
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user', isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .populate('user', 'firstName lastName email')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Product.find({ isActive: true })
        .sort({ soldCount: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders,
      topProducts
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch dashboard data', 
      error: error.message 
    });
  }
});

// Manage products
router.post('/products', async (req: AuthRequest, res) => {
  try {
    const productData = { ...req.body, createdBy: req.user?._id };
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to create product', 
      error: error.message 
    });
  }
});

router.put('/products/:id', async (req: AuthRequest, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to update product', 
      error: error.message 
    });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to delete product', 
      error: error.message 
    });
  }
});

// Manage categories
router.post('/categories', async (req: AuthRequest, res) => {
  try {
    const category = new Category(req.body);
    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to create category', 
      error: error.message 
    });
  }
});

export default router;