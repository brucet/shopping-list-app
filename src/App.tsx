import React, {useEffect, useState} from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import debounce from 'lodash.debounce';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore'
import {db} from './firebase'
import BottomNav from './components/BottomNav'
import HeaderMenu from './components/HeaderMenu'
import CategoriesView from './components/CategoriesView'
import AllItemsView from './components/AllItemsView'
import SuggestionsView from './components/SuggestionsView'
import HeldItemsView from './components/HeldItemsView'
import SingleCategoryView from './components/SingleCategoryView'
import HistoryView from './components/HistoryView';
import {addEmojiToItem} from './utils/emojiMatcher'
import {parseItemText} from './utils/itemParser';
import type {Category, HeldItem, Item, SuggestionsMap, ViewType} from './types'
import './App.css'

const PRESET_COLORS = [
  '#E8F5E9', '#F3E5F5', '#FFEBEE', '#FFF3E0', '#E0F2F1',
  '#FCE4EC', '#F1F8E9', '#E3F2FD',
]

function SortableCategoryItem(props: {
  id: string,
  category: Category,
  items: Item[],
  currentView: ViewType,
  selectedCategoryId: string | null,
  handleCategoryClick: (categoryId: string) => void
}) {
  let {id, category, items, currentView, selectedCategoryId, handleCategoryClick} = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const remainingCount = items.filter(item => item.categoryId === category.id && !item.done).length
  const isActive = currentView === 'single-category' && selectedCategoryId === category.id

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
}


const App = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [heldItems, setHeldItems] = useState<HeldItem[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionsMap>({})
  const [currentView, setCurrentView] = useState<ViewType>('categories')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const [showInlineAddCategoryForm, setShowInlineAddCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0])
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Firestore listeners
  useEffect(() => {
    const unsubscribeCategories = onSnapshot(query(collection(db, "categories"), orderBy("order")), (snapshot) => {
      const cats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });

    const unsubscribeItems = onSnapshot(query(collection(db, "items"), orderBy("createdAt")), (snapshot) => {
      const its = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Item));
      setItems(its);
    });
    
    const unsubscribeHeldItems = onSnapshot(collection(db, "heldItems"), (snapshot) => {
      const hld = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HeldItem));
      setHeldItems(hld);
    });

    const unsubscribeSuggestions = onSnapshot(collection(db, "suggestions"), (snapshot) => {
      const sugs = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data() as SuggestionsMap[string];
        return acc;
      }, {} as SuggestionsMap);
      setSuggestions(sugs);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeItems();
      unsubscribeHeldItems();
      unsubscribeSuggestions();
    };
  }, []);
  
  // Backup state on change
  useEffect(() => {
    const backupState = debounce(async () => {
      const backupRef = doc(collection(db, "backups"));
      await setDoc(backupRef, {
        createdAt: serverTimestamp(),
        categories,
        items,
        heldItems,
        suggestions,
      });
    }, 2000);

    if (categories.length > 0) {
      backupState();
    }

    return () => {
      backupState.cancel();
    };
  }, [categories, items, heldItems, suggestions]);

  // Initialize view from URL on mount
  useEffect(() => {
    const initializeFromUrl = () => {
      const hash = window.location.hash.slice(1) // Remove the # character
      if (!hash) return

      const [view, categoryId] = hash.split('/')
      
      if (view === 'category' && categoryId) {
        // Check if category exists
        const categoryExists = categories.some((c: Category) => c.id === categoryId)
        if (categoryExists) {
          setCurrentView('single-category')
          setSelectedCategoryId(categoryId)
        }
      } else if (view === 'all-items' || view === 'suggestions' || view === 'held-items' || view === 'categories') {
        setCurrentView(view as ViewType)
        setSelectedCategoryId(null)
      }
    }

    initializeFromUrl()
  }, [categories])

  // Update URL whenever view or category changes
  useEffect(() => {
    let hash = ''
    
    if (currentView === 'single-category' && selectedCategoryId) {
      hash = `#category/${selectedCategoryId}`
    } else if (currentView !== 'categories') {
      hash = `#${currentView}`
    }
    
    // Only update if different to avoid infinite loops
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash || window.location.pathname)
    }
  }, [currentView, selectedCategoryId])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1)
      
      if (!hash) {
        setCurrentView('categories')
        setSelectedCategoryId(null)
        return
      }

      const [view, categoryId] = hash.split('/')
      
      if (view === 'category' && categoryId) {
        const categoryExists = categories.some((c: Category) => c.id === categoryId)
        if (categoryExists) {
          setCurrentView('single-category')
          setSelectedCategoryId(categoryId)
        } else {
          // Category doesn't exist, go to categories view
          setCurrentView('categories')
          setSelectedCategoryId(null)
        }
      } else if (view === 'all-items' || view === 'suggestions' || view === 'held-items' || view === 'categories') {
        setCurrentView(view as ViewType)
        setSelectedCategoryId(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [categories])

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setCategories((categories) => {
        const oldIndex = categories.findIndex(c => c.id === active.id);
        const newIndex = categories.findIndex(c => c.id === over.id);
        
        const newCategories = arrayMove(categories, oldIndex, newIndex);

        const batch = writeBatch(db);
        newCategories.forEach((category, index) => {
          const categoryRef = doc(db, "categories", category.id);
          batch.update(categoryRef, { order: index });
        });
        batch.commit();

        return newCategories;
      });
    }
  };

  const addItem = async (categoryId: string, text: string, quantity?: number) => {
    const { text: newText, quantity: newQuantity } = parseItemText(text);
    if (!newText.trim()) return

    const capitalizedText = newText.trim().charAt(0).toUpperCase() + newText.trim().slice(1);
    const itemText = addEmojiToItem(capitalizedText)
    const newItemRef = doc(collection(db, "items"));
    const resolvedQuantity = quantity ?? newQuantity
    const newItem = {
      text: itemText,
      categoryId,
      done: false,
      createdAt: Date.now(),
      ...(resolvedQuantity && { quantity: resolvedQuantity }),
    };
    await setDoc(newItemRef, newItem);
    
    // Update suggestions
    const textForMatching = text.trim()
    const normalizedText = textForMatching.toLowerCase()
    const suggestionRef = doc(db, "suggestions", normalizedText);
    const suggestionDoc = await getDoc(suggestionRef);
    if (suggestionDoc.exists()) {
      await setDoc(suggestionRef, {
        frequency: suggestionDoc.data().frequency + 1,
        lastAdded: Date.now(),
      }, { merge: true });
    } else {
      await setDoc(suggestionRef, {
        text: itemText,
        frequency: 1,
        lastAdded: Date.now(),
        categoryId: categoryId,
      });
    }
  }

  const removeItem = async (itemId: string) => {
    const itemRef = doc(db, "items", itemId);
    await deleteDoc(itemRef);
  }

  const toggleItemDone = async (itemId: string) => {
    const itemRef = doc(db, "items", itemId);
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      await setDoc(itemRef, { done: !itemDoc.data().done }, { merge: true });
    }
  }

  const addCategory = async (name: string, color: string) => {
    const newCategoryRef = doc(collection(db, "categories"));
    await setDoc(newCategoryRef, { name, color, order: categories.length });
  }

  const updateCategory = async (id: string, name: string, color: string) => {
    const categoryRef = doc(db, "categories", id);
    await setDoc(categoryRef, { name, color }, { merge: true });
  }

  const deleteCategory = async (id: string) => {
    const batch = writeBatch(db);
    const categoryRef = doc(db, "categories", id);
    batch.delete(categoryRef);

    const categoryItems = items.filter(item => item.categoryId === id);
    categoryItems.forEach(item => {
      const itemRef = doc(db, "items", item.id);
      batch.delete(itemRef);
    });

    await batch.commit();

    if (selectedCategoryId === id) {
      setCurrentView('categories');
      setSelectedCategoryId(null);
    }
  }

  const editItem = async (itemId: string, newText: string, quantity?: number) => {
    const capitalizedText = newText.trim().charAt(0).toUpperCase() + newText.trim().slice(1);
    const { text: trimmedText } = parseItemText(capitalizedText); // No need to parse quantity from text here
    const itemText = addEmojiToItem(trimmedText)
    const itemRef = doc(db, "items", itemId);
    
    // Find the old item to get its text for suggestion update
    const oldItemDoc = await getDoc(itemRef);
    const oldItem = oldItemDoc.data();

    const updatedItem = {
      text: itemText,
      quantity: quantity === undefined ? null : quantity,
    };
    await setDoc(itemRef, updatedItem, { merge: true });

    // Update suggestions: rename the old suggestion key to new one if text changed
    if (oldItem && oldItem.text !== itemText) {
      const oldTextWithoutEmoji = oldItem.text.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').toLowerCase()
      const newTextWithoutEmoji = newText.trim().toLowerCase()
      
      if (oldTextWithoutEmoji !== newTextWithoutEmoji) {
        const oldSuggestionRef = doc(db, "suggestions", oldTextWithoutEmoji);
        const oldSuggestionDoc = await getDoc(oldSuggestionRef);
        if (oldSuggestionDoc.exists()) {
          const newSuggestionRef = doc(db, "suggestions", newTextWithoutEmoji);
          await setDoc(newSuggestionRef, oldSuggestionDoc.data());
          await deleteDoc(oldSuggestionRef);
        }
      }
    }
  }

  const changeItemCategory = async (itemId: string, toCategoryId: string) => {
    const itemRef = doc(db, "items", itemId);
    await setDoc(itemRef, { categoryId: toCategoryId }, { merge: true });
  }

  const removeDoneItems = async () => {
    if (!confirm('Remove all completed items from your shopping list?')) return

    const batch = writeBatch(db);
    items.forEach(item => {
      if (item.done) {
        const itemRef = doc(db, "items", item.id);
        batch.delete(itemRef);
      }
    });
    await batch.commit();
  }

  const removeAllItems = async () => {
    if (!confirm('Remove ALL items from your shopping list? Held items will be moved back to their categories.')) return

    const batch = writeBatch(db);
    items.forEach(item => {
      const itemRef = doc(db, "items", item.id);
      batch.delete(itemRef);
    });
    heldItems.forEach(item => {
      const itemRef = doc(db, "heldItems", item.id);
      batch.delete(itemRef);
    });
    await batch.commit();
  }

  const holdItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const batch = writeBatch(db);
    const itemRef = doc(db, "items", itemId);
    const heldItemRef = doc(db, "heldItems", itemId);

    batch.delete(itemRef);
    batch.set(heldItemRef, { ...item });
    
    await batch.commit();
  }

  const unholdItem = async (itemId: string, categoryId: string) => {
    const heldItem = heldItems.find(i => i.id === itemId)
    if (!heldItem) return

    const batch = writeBatch(db);
    const heldItemRef = doc(db, "heldItems", itemId);
    const itemRef = doc(db, "items", itemId);

    batch.delete(heldItemRef);
    batch.set(itemRef, { text: heldItem.text, categoryId, done: false, createdAt: heldItem.createdAt || Date.now() });

    await batch.commit();
  }

  const deleteHeldItem = async (itemId: string) => {
    const heldItemRef = doc(db, "heldItems", itemId);
    await deleteDoc(heldItemRef);
  }

  const editHeldItem = async (itemId: string, newText: string, newQuantity?: number) => {
    const { text } = parseItemText(newText);
    const capitalizedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1);
    const itemText = addEmojiToItem(capitalizedText)
    const itemRef = doc(db, "heldItems", itemId);
    
    const updatedItem = {
      text: itemText,
      quantity: newQuantity === undefined ? null : newQuantity,
    };
    await setDoc(itemRef, updatedItem, { merge: true });
  }

  const editSuggestion = async (oldKey: string, newText: string, categoryId: string) => {
    const newKey = newText.toLowerCase()
    const suggestionRef = doc(db, "suggestions", oldKey);
    const suggestionDoc = await getDoc(suggestionRef);
    
    if (!suggestionDoc.exists()) return

    if (oldKey !== newKey) {
      const batch = writeBatch(db);
      const newSuggestionRef = doc(db, "suggestions", newKey);
      batch.set(newSuggestionRef, { ...suggestionDoc.data(), text: addEmojiToItem(newText), categoryId });
      batch.delete(suggestionRef);
      await batch.commit();
    } else {
      await setDoc(suggestionRef, { text: addEmojiToItem(newText), categoryId }, { merge: true });
    }
  }

  const deleteSuggestion = async (key: string) => {
    const suggestionRef = doc(db, "suggestions", key);
    await deleteDoc(suggestionRef);
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    setSelectedCategoryId(null)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCurrentView('single-category')
  }

  const setupSampleData = async () => {
    if (!confirm('This will replace your current list with sample data. Are you sure?')) return

    const batch = writeBatch(db);

    // Clear existing data
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    categoriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    const itemsSnapshot = await getDocs(collection(db, "items"));
    itemsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    const heldItemsSnapshot = await getDocs(collection(db, "heldItems"));
    heldItemsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    const suggestionsSnapshot = await getDocs(collection(db, "suggestions"));
    suggestionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Add sample data
    const { SAMPLE_CATEGORIES, SAMPLE_ITEMS } = await import('./sample-data');
    SAMPLE_CATEGORIES.forEach(category => {
      const categoryRef = doc(db, "categories", category.id);
      batch.set(categoryRef, category);
    });
    Object.entries(SAMPLE_ITEMS).forEach(([categoryId, items]) => {
      items.forEach((item, index) => {
        const itemRef = doc(db, "items", item.id);
        batch.set(itemRef, { ...item, categoryId, createdAt: Date.now() + index });
      });
    });

    await batch.commit();

    setCurrentView('categories');
    setSelectedCategoryId(null);
  }

  const handleInlineAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryColor)
      setNewCategoryName('')
      setNewCategoryColor(PRESET_COLORS[0])
      setShowInlineAddCategoryForm(false)
    }
  }

  // Get the selected category object
  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 Shopping List</h1>
        <HeaderMenu 
          onRemoveDone={removeDoneItems} 
          onRemoveAll={removeAllItems}
          onSetupSampleData={setupSampleData} 
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
                  <form className="sidebar-add-category-form" onSubmit={handleInlineAddCategory}>
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

          <div style={{ flex: 1 }}>
            <div style={{ display: currentView === 'categories' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <CategoriesView
                categories={categories}
                items={items}
                onCategoryClick={handleCategoryClick}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
                presetColors={PRESET_COLORS}
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
                />
              )}
            </div>
            <div style={{ display: currentView === 'history' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <HistoryView />
            </div>
          </div>
        </div>
      </DndContext>

      {/* Bottom Navigation */}
      <BottomNav activeView={currentView} onViewChange={handleViewChange} />
    </div>
  )
}

export default App