import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  updateProfile: (userData: any) =>
    api.put('/auth/profile', userData),
  
  changePassword: (passwordData: any) =>
    api.put('/auth/change-password', passwordData),
  
  addAddress: (addressData: any) =>
    api.post('/auth/addresses', addressData),
  
  updateAddress: (addressId: string, addressData: any) =>
    api.put(`/auth/addresses/${addressId}`, addressData),
  
  deleteAddress: (addressId: string) =>
    api.delete(`/auth/addresses/${addressId}`),
};

// Products API
export const productsAPI = {
  getProducts: (params?: any) =>
    api.get('/products', { params }),
  
  getProduct: (id: string) =>
    api.get(`/products/${id}`),
  
  getFeaturedProducts: () =>
    api.get('/products/featured'),
  
  getTrendingProducts: () =>
    api.get('/products/trending'),
  
  getOnSaleProducts: () =>
    api.get('/products/on-sale'),
  
  searchSuggestions: (query: string) =>
    api.get('/products/search-suggestions', { params: { q: query } }),
  
  getProductsByCategory: (categoryId: string, params?: any) =>
    api.get(`/products/category/${categoryId}`, { params }),
  
  getRecentlyViewed: () =>
    api.get('/products/user/recently-viewed'),
};

// Categories API
export const categoriesAPI = {
  getCategories: () =>
    api.get('/categories'),
  
  getFeaturedCategories: () =>
    api.get('/categories/featured'),
  
  getCategory: (slug: string) =>
    api.get(`/categories/${slug}`),
};

// Cart API
export const cartAPI = {
  getCart: () =>
    api.get('/cart'),
  
  addToCart: (data: { productId: string; quantity: number; variant?: any }) =>
    api.post('/cart/add', data),
  
  updateQuantity: (itemId: string, data: { quantity: number }) =>
    api.put(`/cart/update/${itemId}`, data),
  
  removeFromCart: (itemId: string) =>
    api.delete(`/cart/remove/${itemId}`),
  
  clearCart: () =>
    api.delete('/cart/clear'),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () =>
    api.get('/wishlist'),
  
  addToWishlist: (productId: string) =>
    api.post(`/wishlist/add/${productId}`),
  
  removeFromWishlist: (productId: string) =>
    api.delete(`/wishlist/remove/${productId}`),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData: any) =>
    api.post('/orders/create', orderData),
  
  getMyOrders: (params?: any) =>
    api.get('/orders/my-orders', { params }),
  
  getOrder: (orderId: string) =>
    api.get(`/orders/${orderId}`),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId: string, params?: any) =>
    api.get(`/reviews/product/${productId}`, { params }),
  
  createReview: (reviewData: any) =>
    api.post('/reviews/create', reviewData),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data: { amount: number; currency?: string }) =>
    api.post('/payment/create-payment-intent', data),
  
  confirmPayment: (data: { paymentIntentId: string; orderId: string }) =>
    api.post('/payment/confirm-payment', data),
};

// Admin API
export const adminAPI = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  
  createProduct: (productData: any) =>
    api.post('/admin/products', productData),
  
  updateProduct: (id: string, productData: any) =>
    api.put(`/admin/products/${id}`, productData),
  
  deleteProduct: (id: string) =>
    api.delete(`/admin/products/${id}`),
  
  createCategory: (categoryData: any) =>
    api.post('/admin/categories', categoryData),
};

export default api;