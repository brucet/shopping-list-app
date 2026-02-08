import { useState, useEffect } from 'react';
import type { ViewType, Category } from '../types';

export const useApp = (categories: Category[]) => {
  const [currentView, setCurrentView] = useState<ViewType>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showInlineAddCategoryForm, setShowInlineAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('');

  // Initialize view from URL on mount
  useEffect(() => {
    const initializeFromUrl = () => {
      const hash = window.location.hash.slice(1); // Remove the # character
      if (!hash) return;

      const [view, categoryId] = hash.split('/');

      if (view === 'category' && categoryId) {
        // Check if category exists
        const categoryExists = categories.some((c: Category) => c.id === categoryId);
        if (categoryExists) {
          setCurrentView('single-category');
          setSelectedCategoryId(categoryId);
        }
      } else if (view === 'all-items' || view === 'suggestions' || view === 'held-items' || view === 'categories') {
        setCurrentView(view as ViewType);
        setSelectedCategoryId(null);
      }
    };

    initializeFromUrl();
  }, [categories]);

  // Update URL whenever view or category changes
  useEffect(() => {
    let hash = '';

    if (currentView === 'single-category' && selectedCategoryId) {
      hash = `#category/${selectedCategoryId}`;
    } else if (currentView !== 'categories') {
      hash = `#${currentView}`;
    }

    // Only update if different to avoid infinite loops
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash || window.location.pathname);
    }
  }, [currentView, selectedCategoryId]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);

      if (!hash) {
        setCurrentView('categories');
        setSelectedCategoryId(null);
        return;
      }

      const [view, categoryId] = hash.split('/');

      if (view === 'category' && categoryId) {
        const categoryExists = categories.some((c: Category) => c.id === categoryId);
        if (categoryExists) {
          setCurrentView('single-category');
          setSelectedCategoryId(categoryId);
        } else {
          // Category doesn't exist, go to categories view
          setCurrentView('categories');
          setSelectedCategoryId(null);
        }
      } else if (view === 'all-items' || view === 'suggestions' || view === 'held-items' || view === 'categories') {
        setCurrentView(view as ViewType);
        setSelectedCategoryId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [categories]);
  
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSelectedCategoryId(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('single-category');
  };

  const handleInlineAddCategory = (e: React.FormEvent, addCategory: (name: string, color: string) => void) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor('');
      setShowInlineAddCategoryForm(false);
    }
  };


  return {
    currentView,
    selectedCategoryId,
    showInlineAddCategoryForm,
    newCategoryName,
    newCategoryColor,
    handleViewChange,
    handleCategoryClick,
    setShowInlineAddCategoryForm,
    setNewCategoryName,
    setNewCategoryColor,
    handleInlineAddCategory,
    setSelectedCategoryId,
  };
};
