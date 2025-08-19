import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: { url: string; alt: string; isPrimary: boolean }[];
  rating: { average: number; count: number };
  stock: number;
  brand: string;
  isOnSale?: boolean;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    await addToCart(product._id);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    // Wishlist API call would go here
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const discountPercentage = product.discount || 0;

  return (
    <motion.div
      className="card overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <div className="aspect-square bg-secondary-100 dark:bg-secondary-700">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-secondary-400">No Image</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.isOnSale && discountPercentage > 0 && (
              <span className="bg-coral-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {discountPercentage}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                FEATURED
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <motion.button
              onClick={handleWishlistToggle}
              className="p-2 bg-white/90 dark:bg-secondary-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-secondary-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isInWishlist ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-secondary-600 dark:text-secondary-300" />
              )}
            </motion.button>
            
            <motion.button
              className="p-2 bg-white/90 dark:bg-secondary-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-secondary-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <EyeIcon className="h-5 w-5 text-secondary-600 dark:text-secondary-300" />
            </motion.button>
          </div>

          {/* Quick Add to Cart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-3 left-3 right-3"
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">
              {product.brand}
            </p>
            <h3 className="font-semibold text-secondary-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating.average)
                      ? 'text-yellow-400 fill-current'
                      : 'text-secondary-300 dark:text-secondary-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              ({product.rating.count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-secondary-900 dark:text-white">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-secondary-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-xs text-accent-600 dark:text-accent-400">
                {product.stock} in stock
              </span>
            ) : (
              <span className="text-xs text-red-500">
                Out of stock
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;