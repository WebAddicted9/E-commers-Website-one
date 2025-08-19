import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: { url: string; alt: string; isPrimary: boolean }[];
    stock: number;
  };
  variant?: {
    size?: string;
    color?: string;
    material?: string;
  };
  quantity: number;
  price: number;
  addedAt: string;
}

interface Cart {
  _id?: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number, variant?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!token) {
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data.cart);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      refreshCart();
    } else {
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
    }
  }, [user, token]);

  const addToCart = async (productId: string, quantity = 1, variant?: any) => {
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartAPI.addToCart({ 
        productId, 
        quantity, 
        variant 
      });
      setCart(response.data.cart);
      toast.success('Item added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const response = await cartAPI.updateQuantity(itemId, { quantity });
      setCart(response.data.cart);
      toast.success('Cart updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true);
      const response = await cartAPI.removeFromCart(itemId);
      setCart(response.data.cart);
      toast.success('Item removed from cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await cartAPI.clearCart();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      toast.success('Cart cleared!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    cart,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};