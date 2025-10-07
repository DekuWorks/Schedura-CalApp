export interface EventCategory {
  value: string;
  label: string;
  color: string;
  icon: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    value: 'work',
    label: 'Work',
    color: '#3B82F6', // Blue
    icon: '💼'
  },
  {
    value: 'personal',
    label: 'Personal',
    color: '#10B981', // Green
    icon: '👤'
  },
  {
    value: 'health',
    label: 'Health',
    color: '#EF4444', // Red
    icon: '🏥'
  },
  {
    value: 'social',
    label: 'Social',
    color: '#F59E0B', // Amber
    icon: '👥'
  },
  {
    value: 'travel',
    label: 'Travel',
    color: '#8B5CF6', // Purple
    icon: '✈️'
  },
  {
    value: 'education',
    label: 'Education',
    color: '#06B6D4', // Cyan
    icon: '📚'
  },
  {
    value: 'finance',
    label: 'Finance',
    color: '#84CC16', // Lime
    icon: '💰'
  },
  {
    value: 'hobby',
    label: 'Hobby',
    color: '#F97316', // Orange
    icon: '🎨'
  },
  {
    value: 'family',
    label: 'Family',
    color: '#EC4899', // Pink
    icon: '👨‍👩‍👧‍👦'
  },
  {
    value: 'other',
    label: 'Other',
    color: '#6B7280', // Gray
    icon: '📝'
  }
];

export const getCategoryByValue = (value: string): EventCategory | undefined => {
  return EVENT_CATEGORIES.find(category => category.value === value);
};

export const getCategoryColor = (value: string): string => {
  const category = getCategoryByValue(value);
  return category ? category.color : '#6B7280';
};

export const getCategoryIcon = (value: string): string => {
  const category = getCategoryByValue(value);
  return category ? category.icon : '📝';
};
