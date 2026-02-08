import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category, Item, ViewType } from '../types';

interface SortableCategoryItemProps {
  id: string;
  category: Category;
  items: Item[];
  currentView: ViewType;
  selectedCategoryId: string | null;
  handleCategoryClick: (categoryId: string) => void;
}

export const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({
  id,
  category,
  items,
  currentView,
  selectedCategoryId,
  handleCategoryClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const remainingCount = items.filter(item => item.categoryId === category.id && !item.done).length;
  const isActive = currentView === 'single-category' && selectedCategoryId === category.id;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        <button
          className={`sidebar-item ${isActive ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category.id)}
        >
          <div className="sidebar-item-left">
            <div className="sidebar-drag-handle" {...listeners}>
              <span className="drag-indicator">⋮⋮</span>
            </div>
            <span className="sidebar-item-name">{category.name}</span>
          </div>
          <span className="sidebar-item-count">{remainingCount}</span>
        </button>
    </div>
  );
};
