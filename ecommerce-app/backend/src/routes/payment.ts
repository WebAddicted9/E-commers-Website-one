import express from 'express';
import Stripe from 'stripe';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo', {
  apiVersion: '2024-12-18.acacia'
});

// Create payment intent
router.post('/create-payment-intent', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency,
      metadata: {
        userId: req.user?._id.toString() || ''
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to create payment intent', 
      error: error.message 
    });
  }
});

// Confirm payment
router.post('/confirm-payment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      // This would be implemented with the Order model
      res.json({
        message: 'Payment confirmed successfully',
        paymentStatus: 'completed'
      });
    } else {
      res.status(400).json({
        message: 'Payment not completed',
        paymentStatus: paymentIntent.status
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to confirm payment', 
      error: error.message 
    });
  }
});

export default router;