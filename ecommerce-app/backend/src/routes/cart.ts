import express from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's cart
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive'
      })
      .lean();

    if (!cart) {
      return res.json({ 
        cart: { items: [], totalItems: 0, totalPrice: 0 } 
      });
    }

    // Filter out inactive products
    cart.items = cart.items.filter(item => 
      item.product && (item.product as any).isActive
    );

    res.json({ cart });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch cart', 
      error: error.message 
    });
  }
});

// Add item to cart
router.post('/add', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock',
        availableStock: product.stock
      });
    }

    let cart = await Cart.findOne({ user: req.user?._id });
    
    if (!cart) {
      cart = new Cart({ 
        user: req.user?._id, 
        items: [] 
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: 'Cannot add more items. Insufficient stock',
          availableStock: product.stock
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variant,
        quantity,
        price: product.price,
        addedAt: new Date()
      });
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive'
      })
      .lean();

    res.json({
      message: 'Item added to cart successfully',
      cart: updatedCart
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to add item to cart', 
      error: error.message 
    });
  }
});

// Update cart item quantity
router.put('/update/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (!product || quantity > product.stock) {
      return res.status(400).json({ 
        message: 'Insufficient stock',
        availableStock: product?.stock || 0
      });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive'
      })
      .lean();

    res.json({
      message: 'Cart updated successfully',
      cart: updatedCart
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to update cart', 
      error: error.message 
    });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.id(itemId)?.remove();
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive'
      })
      .lean();

    res.json({
      message: 'Item removed from cart successfully',
      cart: updatedCart
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to remove item from cart', 
      error: error.message 
    });
  }
});

// Clear cart
router.delete('/clear', authenticate, async (req: AuthRequest, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user?._id },
      { items: [], totalItems: 0, totalPrice: 0 }
    );

    res.json({ message: 'Cart cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to clear cart', 
      error: error.message 
    });
  }
});

export default router;