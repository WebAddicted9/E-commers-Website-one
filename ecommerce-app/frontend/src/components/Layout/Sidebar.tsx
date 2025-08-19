import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  TagIcon,
  SparklesIcon,
  FireIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '../../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getFeaturedCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const navigationItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Shop', href: '/shop', icon: ShoppingBagIcon },
    { name: 'Featured', href: '/shop?featured=true', icon: SparklesIcon },
    { name: 'On Sale', href: '/shop?onSale=true', icon: FireIcon },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-700 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center space-x-2" onClick={onClose}>
                  <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <span className="text-xl font-display font-bold text-gradient">
                    EcoShop
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-secondary-600 dark:text-secondary-300" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-3">
                    Navigation
                  </h3>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500'
                            : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-3">
                      Categories
                    </h3>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Link
                          key={category._id}
                          to={`/shop?category=${category._id}`}
                          onClick={onClose}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            {category.icon ? (
                              <img src={category.icon} alt="" className="h-5 w-5" />
                            ) : (
                              <TagIcon className="h-5 w-5" />
                            )}
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
                <h3 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/shop?featured=true"
                    onClick={onClose}
                    className="block px-3 py-2 rounded-lg text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                  >
                    ⭐ Featured Products
                  </Link>
                  <Link
                    to="/shop?onSale=true"
                    onClick={onClose}
                    className="block px-3 py-2 rounded-lg text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                  >
                    🔥 Hot Deals
                  </Link>
                  <Link
                    to="/shop?sort=newest"
                    onClick={onClose}
                    className="block px-3 py-2 rounded-lg text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                  >
                    🆕 New Arrivals
                  </Link>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;