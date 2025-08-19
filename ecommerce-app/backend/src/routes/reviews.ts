import express from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let sortObj: any = { createdAt: -1 };
    if (sort === 'rating-high') sortObj = { rating: -1 };
    if (sort === 'rating-low') sortObj = { rating: 1 };
    if (sort === 'helpful') sortObj = { helpfulVotes: -1 };

    const reviews = await Review.find({ 
      product: productId, 
      isApproved: true 
    })
    .populate('user', 'firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .lean();

    const total = await Review.countDocuments({ 
      product: productId, 
      isApproved: true 
    });

    res.json({
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalReviews: total
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch reviews', 
      error: error.message 
    });
  }
});

// Create review
router.post('/create', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Check if user has purchased this product
    const order = await Order.findOne({
      _id: orderId,
      user: req.user?._id,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ 
        message: 'You can only review products you have purchased and received' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user?._id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.user?._id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: true
    });

    await review.save();

    // Update product rating
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const averageRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
      'rating.average': Math.round(averageRating * 10) / 10,
      'rating.count': allReviews.length
    });

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to create review', 
      error: error.message 
    });
  }
});

export default router;