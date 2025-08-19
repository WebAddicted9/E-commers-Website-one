import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/Product/ProductCard';
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
    featured: searchParams.get('featured') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    inStock: searchParams.get('inStock') === 'true'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const updateFilters = (newFilters: any) => {
    const updatedParams = new URLSearchParams();
    
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        updatedParams.set(key, value.toString());
      }
    });
    
    setSearchParams(updatedParams);
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setSearchParams({});
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      rating: '',
      sort: 'newest',
      featured: false,
      onSale: false,
      inStock: false
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-secondary-900 dark:text-white mb-2">
              {filters.search ? `Search Results for "${filters.search}"` : 'Shop'}
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              {pagination.totalProducts} products found
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-secondary-700 text-primary-600 shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-400'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-secondary-700 text-primary-600 shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-400'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="input-field w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={false}
            animate={{ 
              width: showFilters ? 280 : 0,
              opacity: showFilters ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="card p-6 space-y-6 w-70">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-secondary-900 dark:text-white">
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-white mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={filters.category === category._id}
                        onChange={(e) => updateFilters({ category: e.target.value })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-white mb-3">
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilters({ minPrice: e.target.value })}
                    className="input-field text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-white mb-3">
                  Rating
                </h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating.toString()}
                        onChange={(e) => updateFilters({ rating: e.target.value })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                        {rating}+ Stars
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-white mb-3">
                  Special
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => updateFilters({ featured: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                      Featured Products
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={(e) => updateFilters({ onSale: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                      On Sale
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => updateFilters({ inStock: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                      In Stock Only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, index) => (
                  <div key={index} className="card p-4 animate-pulse">
                    <div className="aspect-square bg-secondary-200 dark:bg-secondary-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded mb-2"></div>
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AdjustmentsHorizontalIcon className="h-12 w-12 text-secondary-400" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isActive = page === pagination.currentPage;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', page.toString());
                          setSearchParams(newParams);
                        }}
                        className={`px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;