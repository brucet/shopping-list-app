export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Item {
  id: string;
  text: string;
  done?: boolean;
}

export interface ItemsMap {
  [categoryId: string]: Item[];
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
}

export type ViewType = 'categories' | 'all-items' | 'suggestions' | 'held-items' | 'single-category';
