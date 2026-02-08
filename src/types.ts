export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Item {
  id: string;
  createdAt: number;
  text: string;
  done?: boolean;
  categoryId: string;
  quantity?: string;
}

export interface Suggestion {
  text: string;
  frequency: number;
  lastAdded: number;
  categoryId: string;
}

export interface SuggestionsMap {
  [normalizedText: string]: Suggestion;
}

export interface HeldItem {
  id: string;
  text: string;
  categoryId: string;
  quantity?: string;
  createdAt: number;
}

export type ViewType = 'categories' | 'all-items' | 'suggestions' | 'held-items' | 'single-category' | 'history';

// Exported List interface
export interface List {
  id: string;
  name: string;
  createdAt: number;
  lastOpened: number;
}