import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    variant?: {
      size?: string;
      color?: string;
      material?: string;
    };
    quantity: number;
    price: number;
    addedAt: Date;
  }[];
  totalItems: number;
  totalPrice: number;
  updatedAt: Date;
}

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      size: String,
      color: String,
      material: String
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Maximum quantity is 10']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
CartSchema.index({ user: 1 });
CartSchema.index({ 'items.product': 1 });

// Calculate totals before saving
CartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

// Remove empty carts
CartSchema.pre('save', function(next) {
  if (this.items.length === 0) {
    this.totalItems = 0;
    this.totalPrice = 0;
  }
  next();
});

export default mongoose.model<ICart>('Cart', CartSchema);