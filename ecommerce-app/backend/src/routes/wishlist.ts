import express from 'express';
import Wishlist from '../models/Wishlist';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user?._id })
      .populate({
        path: 'products.product',
        select: 'name price images rating stock isActive'
      })
      .lean();

    if (!wishlist) {
      return res.json({ 
        wishlist: { products: [] } 
      });
    }

    // Filter out inactive products
    wishlist.products = wishlist.products.filter(item => 
      item.product && (item.product as any).isActive
    );

    res.json({ wishlist });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch wishlist', 
      error: error.message 
    });
  }
});

// Add product to wishlist
router.post('/add/:productId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user?._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ 
        user: req.user?._id, 
        products: [] 
      });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(item => 
      item.product.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.products.push({
      product: productId,
      addedAt: new Date()
    });

    await wishlist.save();

    res.json({ message: 'Product added to wishlist successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to add to wishlist', 
      error: error.message 
    });
  }
});

// Remove product from wishlist
router.delete('/remove/:productId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user?._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(item => 
      item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({ message: 'Product removed from wishlist successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to remove from wishlist', 
      error: error.message 
    });
  }
});

export default router;