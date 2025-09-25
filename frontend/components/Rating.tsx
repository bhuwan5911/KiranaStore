import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  reviews?: number;
}

export const Rating: React.FC<RatingProps> = ({ rating, reviews }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.round(rating) ? 'text-accent fill-current' : 'text-gray-300'}
        />
      ))}
      {reviews && <span className="ml-2 text-sm text-text-secondary">({reviews} reviews)</span>}
    </div>
  );
};