import React from 'react';
import CategoriesView from './CategoriesView';
import AllItemsView from './AllItemsView';
import SuggestionsView from './SuggestionsView';
import HeldItemsView from './HeldItemsView';
import SingleCategoryView from './SingleCategoryView';
import HistoryView from './HistoryView';
import InvitationsView from './InvitationsView';
import type { Category, Item, SuggestionsMap, HeldItem, ViewType, ListInvite } from '../types';



interface MainViewProps {
  currentView: ViewType;
  categories: Category[];
  items: Item[];
  suggestions: SuggestionsMap;
  heldItems: HeldItem[];
  invitations: ListInvite[];
  selectedCategoryId: string | null;
  handleCategoryClick: (categoryId: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  removeItem: (itemId: string) => void;
  toggleItemDone: (itemId: string) => void;
  editItem: (itemId: string, newText: string, quantity?: string) => void;
  changeItemCategory: (itemId: string, toCategoryId: string) => void;
  holdItem: (itemId: string) => void;
  addItem: (categoryId: string, text: string, quantity?: string) => void;
  editSuggestion: (oldKey: string, newText: string, categoryId: string) => void;
  deleteSuggestion: (key: string) => void;
  unholdItem: (itemId: string, categoryId: string) => void;
  deleteHeldItem: (itemId: string) => void;
  editHeldItem: (itemId: string, newText: string, newQuantity?: string) => void;
  acceptInvitation: (invite: ListInvite) => void;
  declineInvitation: (invite: ListInvite) => void;
  handleViewChange: (view: ViewType) => void;
}

const MainView: React.FC<MainViewProps> = ({
  currentView,
  categories,
  items,
  suggestions,
  heldItems,
  invitations,
  selectedCategoryId,
  handleCategoryClick,
  updateCategory,
  deleteCategory,
  removeItem,
  toggleItemDone,
  editItem,
  changeItemCategory,
  holdItem,
  addItem,
  editSuggestion,
  deleteSuggestion,
  unholdItem,
  deleteHeldItem,
  editHeldItem,
  acceptInvitation,
  declineInvitation,
  handleViewChange,
}) => {
  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: currentView === 'categories' ? 'block' : 'none', gridArea: '1 / 1' }}>
        <CategoriesView
          categories={categories}
          items={items}
          onCategoryClick={handleCategoryClick}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
        />
      </div>
      <div style={{ display: currentView === 'all-items' ? 'block' : 'none', gridArea: '1 / 1' }}>
        <AllItemsView
          categories={categories}
          items={items}
          onRemoveItem={removeItem}
          onToggleItem={toggleItemDone}
          onEditItem={editItem}
          onChangeCategory={changeItemCategory}
          onHoldItem={holdItem}
        />
      </div>
      <div style={{ display: currentView === 'suggestions' ? 'block' : 'none', gridArea: '1 / 1' }}>
        <SuggestionsView
          suggestions={suggestions}
          categories={categories}
          items={items}
          onAddSuggestion={addItem}
          onEditSuggestion={editSuggestion}
          onDeleteSuggestion={deleteSuggestion}
        />
      </div>
      <div style={{ display: currentView === 'held-items' ? 'block' : 'none', gridArea: '1 / 1' }}>
        <HeldItemsView
          heldItems={heldItems}
          categories={categories}
          onUnhold={unholdItem}
          onDelete={deleteHeldItem}
          onEditItem={editHeldItem}
        />
      </div>
      <div style={{ display: currentView === 'single-category' ? 'block' : 'none', gridArea: '1 / 1' }}>
        {selectedCategory && (
          <SingleCategoryView
            category={selectedCategory}
            categories={categories}
            items={items.filter(item => item.categoryId === selectedCategoryId)}
            suggestions={suggestions}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onToggleItem={toggleItemDone}
            onEditItem={editItem}
            onChangeCategory={changeItemCategory}
            onHoldItem={holdItem}
            onBack={() => handleViewChange('categories')}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        )}
      </div>
      <div style={{ display: currentView === 'history' ? 'block' : 'none', gridArea: '1 / 1' }}>
        <HistoryView />
      </div>
      <div style={{ display: currentView === 'invitations' ? 'block' : 'none', gridArea: '1 / 1' }}>
        <InvitationsView
          invitations={invitations}
          onAccept={acceptInvitation}
          onDecline={declineInvitation}
        />
      </div>
    </div>
  );
};

export default MainView;