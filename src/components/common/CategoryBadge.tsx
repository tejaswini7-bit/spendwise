import React from 'react';
import { Category } from '../../types';
import { CATEGORIES } from '../../engine/categories';
import { CategoryIcon } from './CategoryIcon';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const cat = CATEGORIES[category] || CATEGORIES.Other;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${cat.bgColor} ${cat.borderColor} ${cat.textColor} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <CategoryIcon category={category} className={iconSizes[size]} />}
      <span>{cat.label || category}</span>
    </span>
  );
};
