import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { auth } from './firebase';
import Login from './components/Login';
import BottomNav from './components/BottomNav';
import HeaderMenu from './components/HeaderMenu';
import MainView from './components/MainView';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import { useApp } from './hooks/useApp';
import { SortableCategoryItem } from './components/SortableCategoryItem';
import './App.css';
import './styles/Login.css';

const PRESET_COLORS = [
  '#E8F5E9', '#F3E5F5', '#FFEBEE', '#FFF3E0', '#E0F2F1',
  '#FCE4EC', '#F1F8E9', '#E3F2FD',
];

const App = () => {
  const { user, isLoading } = useAuth();
  const {
    lists,
    activeListId,
    categories,
    items,
    heldItems,
    suggestions,
    invitations,
    hasRootData,
    switchList,
    createList,
    updateList,
    deleteList,
    migrateData,
    addItem,
    removeItem,
    toggleItemDone,
    addCategory,
    updateCategory,
    deleteCategory,
    editItem,
    changeItemCategory,
    removeDoneItems,
    removeAllItems,
    holdItem,
    unholdItem,
    deleteHeldItem,
    editHeldItem,
    editSuggestion,
    deleteSuggestion,
    setupSampleData,
    acceptInvitation,
    declineInvitation,
    handleCategoryOrderChange,
  } = useFirestore(user);
  const {
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
  } = useApp(categories);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c: any) => c.id === active.id);
      const newIndex = categories.findIndex((c: any) => c.id === over.id);
      
      handleCategoryOrderChange(oldIndex, newIndex);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const activeList = lists.find(l => l.id === activeListId);

  if (isLoading) {
    return <div className="main-loading">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 {activeList?.name || 'Shopping List'}</h1>
        <HeaderMenu 
          user={user}
          onLogout={handleLogout}
          onRemoveDone={removeDoneItems} 
          onRemoveAll={removeAllItems}
          onSetupSampleData={setupSampleData} 
          hasRootData={hasRootData}
          onMigrateData={migrateData}
          lists={lists}
          activeListId={activeListId}
          onSelectList={switchList}
          onCreateList={createList}
          onDeleteList={deleteList}
          onUpdateList={updateList}
        />
      </header>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="app-main">
          {/* Desktop Sidebar */}
          <aside className="sidebar">
            <SortableContext 
              items={categories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <nav className="sidebar-nav">
                {categories.map((category) => (
                  <SortableCategoryItem 
                    key={category.id} 
                    id={category.id} 
                    category={category} 
                    items={items}
                    currentView={currentView}
                    selectedCategoryId={selectedCategoryId}
                    handleCategoryClick={handleCategoryClick}
                  />
                ))}
                
                {/* Inline Add Category form */}
                {showInlineAddCategoryForm ? (
                  <form className="sidebar-add-category-form" onSubmit={(e) => handleInlineAddCategory(e, addCategory)}>
                    <input
                      type="text"
                      placeholder="New category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      autoFocus
                      className="sidebar-category-input"
                    />
                    <div className="sidebar-color-picker">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`sidebar-color-option ${newCategoryColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewCategoryColor(color)}
                        />
                      ))}
                    </div>
                    <div className="sidebar-add-category-actions">
                      <button type="submit" className="sidebar-save-btn">✓ Add</button>
                      <button type="button" className="sidebar-cancel-btn" onClick={() => setShowInlineAddCategoryForm(false)}>✕ Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="sidebar-item add-category-toggle"
                    onClick={() => setShowInlineAddCategoryForm(true)}
                  >
                    <span className="sidebar-item-name">➕ Add New Category</span>
                  </button>
                )}
              </nav>
            </SortableContext>
          </aside>

          <MainView
            currentView={currentView}
            categories={categories}
            items={items}
            suggestions={suggestions}
            heldItems={heldItems}
            invitations={invitations}
            selectedCategoryId={selectedCategoryId}
            handleCategoryClick={handleCategoryClick}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
            removeItem={removeItem}
            toggleItemDone={toggleItemDone}
            editItem={editItem}
            changeItemCategory={changeItemCategory}
            holdItem={holdItem}
            addItem={addItem}
            editSuggestion={editSuggestion}
            deleteSuggestion={deleteSuggestion}
            unholdItem={unholdItem}
            deleteHeldItem={deleteHeldItem}
            editHeldItem={editHeldItem}
            acceptInvitation={acceptInvitation}
            declineInvitation={declineInvitation}
            handleViewChange={handleViewChange}
          />
        </div>
      </DndContext>

      {/* Bottom Navigation */}
      <BottomNav activeView={currentView} onViewChange={handleViewChange} />
    </div>
  );
};

export default App;
