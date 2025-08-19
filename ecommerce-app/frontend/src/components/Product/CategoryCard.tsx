import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount: number;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link to={`/shop?category=${category._id}`}>
      <motion.div
        className="card overflow-hidden group cursor-pointer"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {/* Category Image */}
          <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {category.icon ? (
                  <img src={category.icon} alt="" className="h-16 w-16" />
                ) : (
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>

          {/* Arrow Icon */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-2 bg-white/90 dark:bg-secondary-800/90 rounded-full">
              <ChevronRightIcon className="h-4 w-4 text-secondary-600 dark:text-secondary-300" />
            </div>
          </div>
        </div>

        {/* Category Info */}
        <div className="p-4 text-center">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            {category.productCount} products
          </p>
          {category.description && (
            <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-2 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default CategoryCard;