import express from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create order
router.post('/create', authenticate, async (req: AuthRequest, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user?._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = item.product as any;
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}`,
          availableStock: product.stock
        });
      }
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const tax = subtotal * 0.18; // 18% GST
    const discount = 0; // Apply coupon logic here
    const total = subtotal + shippingCost + tax - discount;

    // Create order
    const order = new Order({
      user: req.user?._id,
      items: cart.items.map(item => ({
        product: item.product._id,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode,
      total,
      paymentMethod,
      createdBy: req.user?._id
    });

    await order.save();

    // Update product stock and sold count
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { 
          stock: -item.quantity,
          soldCount: item.quantity
        }
      });
    }

    // Calculate loyalty points (1 point per ₹100)
    const pointsEarned = Math.floor(total / 100);
    await User.findByIdAndUpdate(req.user?._id, {
      $inc: { loyaltyPoints: pointsEarned }
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user?._id },
      { items: [], totalItems: 0, totalPrice: 0 }
    );

    res.status(201).json({
      message: 'Order created successfully',
      order,
      loyaltyPointsEarned: pointsEarned
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message 
    });
  }
});

// Get user orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ user: req.user?._id })
      .populate({
        path: 'items.product',
        select: 'name images price'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments({ user: req.user?._id });

    res.json({
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalOrders: total
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch orders', 
      error: error.message 
    });
  }
});

// Get single order
router.get('/:orderId', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user?._id
    })
    .populate({
      path: 'items.product',
      select: 'name images price'
    })
    .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch order', 
      error: error.message 
    });
  }
});

export default router;