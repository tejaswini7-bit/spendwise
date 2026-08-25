import { Category, CategoryInfo } from '../types';

export const CATEGORIES: Record<Category, CategoryInfo> = {
  Food: {
    id: 'Food',
    label: 'Food & Dining',
    iconName: 'Utensils',
    color: '#10b981', // Emerald
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    description: 'Chai stalls, snacks, restaurants, groceries & food deliveries',
  },
  Shopping: {
    id: 'Shopping',
    label: 'Shopping',
    iconName: 'ShoppingBag',
    color: '#6366f1', // Indigo
    bgColor: 'bg-indigo-500/15',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400',
    description: 'Online shopping, apparel, electronics & retail purchases',
  },
  Transport: {
    id: 'Transport',
    label: 'Transport',
    iconName: 'Car',
    color: '#06b6d4', // Cyan
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    description: 'Auto-rickshaw, cab rides, metro, fuel & bus fares',
  },
  Entertainment: {
    id: 'Entertainment',
    label: 'Entertainment',
    iconName: 'Film',
    color: '#a855f7', // Purple
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    description: 'Movie tickets, streaming subscriptions, gaming & outings',
  },
  Education: {
    id: 'Education',
    label: 'Education',
    iconName: 'GraduationCap',
    color: '#f59e0b', // Amber
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    description: 'Tuition fees, study materials, courses & books',
  },
  Bills: {
    id: 'Bills',
    label: 'Bills & Utilities',
    iconName: 'Receipt',
    color: '#f43f5e', // Rose
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    description: 'Mobile recharge, Wi-Fi, electricity & utility bills',
  },
  Healthcare: {
    id: 'Healthcare',
    label: 'Healthcare',
    iconName: 'Activity',
    color: '#3b82f6', // Blue
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    description: 'Pharmacies, medicine, doctor consults & tests',
  },
  Personal: {
    id: 'Personal',
    label: 'Personal & Peer',
    iconName: 'Users',
    color: '#fb923c', // Orange
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    description: 'Transfers to friends, rent sharing, personal loans',
  },
  Other: {
    id: 'Other',
    label: 'Other / Misc',
    iconName: 'Tag',
    color: '#94a3b8', // Slate
    bgColor: 'bg-slate-500/15',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-400',
    description: 'Miscellaneous and one-off uncategorized expenses',
  },
};

export const CATEGORY_LIST: Category[] = [
  'Food',
  'Shopping',
  'Transport',
  'Entertainment',
  'Education',
  'Bills',
  'Healthcare',
  'Personal',
  'Other',
];
