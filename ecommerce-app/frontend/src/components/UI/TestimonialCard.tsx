import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  location: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="card p-6 h-full">
      {/* Rating Stars */}
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${
              i < testimonial.rating
                ? 'text-yellow-400'
                : 'text-secondary-300 dark:text-secondary-600'
            }`}
          />
        ))}
      </div>

      {/* Comment */}
      <blockquote className="text-secondary-700 dark:text-secondary-300 mb-6 italic">
        "{testimonial.comment}"
      </blockquote>

      {/* User Info */}
      <div className="flex items-center space-x-3">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold text-secondary-900 dark:text-white">
            {testimonial.name}
          </h4>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;