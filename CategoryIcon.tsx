import React from 'react';
import { 
  Utensils, 
  ShoppingBag, 
  Car, 
  Film, 
  GraduationCap, 
  Receipt, 
  Activity, 
  Users, 
  Tag, 
  HelpCircle 
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryIconProps {
  category: Category;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-4 h-4', size }) => {
  switch (category) {
    case 'Food':
      return <Utensils className={className} size={size} />;
    case 'Shopping':
      return <ShoppingBag className={className} size={size} />;
    case 'Transport':
      return <Car className={className} size={size} />;
    case 'Entertainment':
      return <Film className={className} size={size} />;
    case 'Education':
      return <GraduationCap className={className} size={size} />;
    case 'Bills':
      return <Receipt className={className} size={size} />;
    case 'Healthcare':
      return <Activity className={className} size={size} />;
    case 'Personal':
      return <Users className={className} size={size} />;
    case 'Other':
    default:
      return <Tag className={className} size={size} />;
  }
};
