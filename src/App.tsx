import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import BottomNav from './components/BottomNav'
import HeaderMenu from './components/HeaderMenu'
import CategoriesView from './components/CategoriesView'
import AllItemsView from './components/AllItemsView'
import SuggestionsView from './components/SuggestionsView'
import HeldItemsView from './components/HeldItemsView'
import SingleCategoryView from './components/SingleCategoryView'
import { addEmojiToItem } from './utils/emojiMatcher'
import type { Category, Item, ItemsMap, SuggestionsMap, HeldItem, ViewType } from './types'
import './App.css'

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '🥬 Fruit & Veg', color: '#E8F5E9' },
  { id: '2', name: '🥛 Dairy', color: '#F3E5F5' },
  { id: '3', name: '🥩 Meat & Fish', color: '#FFEBEE' },
  { id: '4', name: '🥫 Pantry', color: '#FFF3E0' },
  { id: '5', name: '❄️ Frozen', color: '#E0F2F1' },
  { id: '6', name: '🍞 Bakery', color: '#FCE4EC' },
  { id: '7', name: '🥚 Eggs & Proteins', color: '#FFF9C4' },
  { id: '8', name: '🧀 Cheese & Dairy Alt', color: '#F1F8E9' },
  { id: '9', name: '🥤 Beverages', color: '#E3F2FD' },
  { id: '10', name: '🍫 Snacks & Sweets', color: '#F8BBD0' },
  { id: '11', name: '🧂 Seasonings & Oils', color: '#FFECB3' },
  { id: '12', name: '🧃 Condiments', color: '#B2DFDB' },
]

const DEFAULT_ITEMS: ItemsMap = {
  '1': [{ id: '1-1', text: 'Apples' }, { id: '1-2', text: 'Carrots' }],
  '2': [{ id: '2-1', text: 'Milk' }, { id: '2-2', text: 'Cheese' }],
  '3': [],
  '4': [{ id: '4-1', text: 'Rice' }],
  '5': [],
  '6': [],
  '7': [],
  '8': [],
  '9': [],
  '10': [],
  '11': [],
  '12': [],
}

const DEFAULT_SUGGESTIONS: SuggestionsMap = {}

const DEFAULT_HELD_ITEMS: HeldItem[] = []

// Load from localStorage or use defaults
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultValue
  }
}

const App = () => {
  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromStorage('categories', DEFAULT_CATEGORIES)
  )
  const [items, setItems] = useState<ItemsMap>(() => 
    loadFromStorage('items', DEFAULT_ITEMS)
  )
  const [heldItems, setHeldItems] = useState<HeldItem[]>(() => 
    loadFromStorage('heldItems', DEFAULT_HELD_ITEMS)
  )
  const [suggestions, setSuggestions] = useState<SuggestionsMap>(() => 
    loadFromStorage('suggestions', DEFAULT_SUGGESTIONS)
  )
  const [nextItemId, setNextItemId] = useState<number>(() => 
    loadFromStorage('nextItemId', 100)
  )
  const [currentView, setCurrentView] = useState<ViewType>('categories')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // Initialize view from URL on mount
  useEffect(() => {
    const initializeFromUrl = () => {
      const hash = window.location.hash.slice(1) // Remove the # character
      if (!hash) return

      const [view, categoryId] = hash.split('/')
      
      if (view === 'category' && categoryId) {
        // Check if category exists
        const categoryExists = categories.some(c => c.id === categoryId)
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
        const categoryExists = categories.some(c => c.id === categoryId)
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

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items))
  }, [items])

  // Save nextItemId to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nextItemId', JSON.stringify(nextItemId))
  }, [nextItemId])

  // Save suggestions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('suggestions', JSON.stringify(suggestions))
  }, [suggestions])

  // Save held items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('heldItems', JSON.stringify(heldItems))
  }, [heldItems])

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result

    if (!destination) return

    // If dragging a category
    if (type === 'CATEGORY') {
      const newCategories = Array.from(categories)
      const [removed] = newCategories.splice(source.index, 1)
      newCategories.splice(destination.index, 0, removed)
      setCategories(newCategories)
      return
    }

    // If dragging an item
    const sourceId = source.droppableId
    const destinationId = destination.droppableId

    // If dropped in same position
    if (sourceId === destinationId && source.index === destination.index) {
      return
    }

    const sourceItems = Array.from(items[sourceId] || [])
    const destItems = sourceId === destinationId ? sourceItems : Array.from(items[destinationId] || [])
    const [draggedItem] = sourceItems.splice(source.index, 1)

    if (sourceId !== destinationId) {
      destItems.splice(destination.index, 0, draggedItem)
      setItems({
        ...items,
        [sourceId]: sourceItems,
        [destinationId]: destItems,
      })
    } else {
      destItems.splice(destination.index, 0, draggedItem)
      setItems({
        ...items,
        [sourceId]: destItems,
      })
    }
  }

  const addItem = (categoryId: string, text: string) => {
    if (!text.trim()) return

    const itemText = addEmojiToItem(text.trim())
    const newItem: Item = {
      id: `${categoryId}-${nextItemId}`,
      text: itemText,
    }

    setItems({
      ...items,
      [categoryId]: [...(items[categoryId] || []), newItem],
    })
    setNextItemId(nextItemId + 1)

    // Update suggestions
    const textForMatching = text.trim()
    const normalizedText = textForMatching.toLowerCase()
    setSuggestions(prev => ({
      ...prev,
      [normalizedText]: {
        text: itemText,
        frequency: (prev[normalizedText]?.frequency || 0) + 1,
        lastAdded: Date.now(),
        categoryId: categoryId,
      }
    }))
  }

  const removeItem = (categoryId: string, itemId: string) => {
    setItems({
      ...items,
      [categoryId]: items[categoryId].filter((item) => item.id !== itemId),
    })
  }

  const toggleItemDone = (categoryId: string, itemId: string) => {
    setItems({
      ...items,
      [categoryId]: items[categoryId]
        .map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item
        )
        .sort((a, b) => {
          // Sort done items to the bottom
          if (a.done && !b.done) return 1
          if (!a.done && b.done) return -1
          return 0
        }),
    })
  }

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    }
    setCategories([...categories, newCategory])
    setItems({
      ...items,
      [newCategory.id]: [],
    })
  }

  const updateCategory = (id: string, name: string, color: string) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, name, color } : cat)))
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    const newItems = { ...items }
    delete newItems[id]
    setItems(newItems)
    if (selectedCategoryId === id) {
      setCurrentView('categories')
      setSelectedCategoryId(null)
    }
  }

  const editItem = (categoryId: string, itemId: string, newText: string) => {
    const itemText = addEmojiToItem(newText.trim())
    
    // Find the old item to get its text for suggestion update
    const oldItem = items[categoryId].find(item => item.id === itemId)
    
    setItems({
      ...items,
      [categoryId]: items[categoryId].map((item) =>
        item.id === itemId ? { ...item, text: itemText } : item
      ),
    })

    // Update suggestions: rename the old suggestion key to new one if text changed
    if (oldItem && oldItem.text !== itemText) {
      const oldTextWithoutEmoji = oldItem.text.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').toLowerCase()
      const newTextWithoutEmoji = newText.trim().toLowerCase()
      
      if (oldTextWithoutEmoji !== newTextWithoutEmoji && suggestions[oldTextWithoutEmoji]) {
        const newSuggestions = { ...suggestions }
        const oldSuggestion = newSuggestions[oldTextWithoutEmoji]
        delete newSuggestions[oldTextWithoutEmoji]
        newSuggestions[newTextWithoutEmoji] = {
          ...oldSuggestion,
          text: itemText,
        }
        setSuggestions(newSuggestions)
      }
    }
  }

  const changeItemCategory = (fromCategoryId: string, itemId: string, toCategoryId: string) => {
    const item = items[fromCategoryId].find(i => i.id === itemId)
    if (!item) return

    setItems({
      ...items,
      [fromCategoryId]: items[fromCategoryId].filter(i => i.id !== itemId),
      [toCategoryId]: [...(items[toCategoryId] || []), item],
    })
  }

  const removeDoneItems = () => {
    if (!confirm('Remove all completed items from your shopping list?')) return

    const newItems: ItemsMap = {}
    Object.keys(items).forEach(categoryId => {
      newItems[categoryId] = items[categoryId].filter(item => !item.done)
    })
    setItems(newItems)
  }

  const removeAllItems = () => {
    if (!confirm('Remove ALL items from your shopping list? Held items will be moved back to their categories.')) return

    // Move held items back to their categories
    const newItems = { ...items }
    heldItems.forEach(heldItem => {
      if (newItems[heldItem.categoryId]) {
        newItems[heldItem.categoryId].push({
          id: heldItem.id,
          text: heldItem.text,
        })
      }
    })

    // Clear held items
    setHeldItems([])

    // Clear all items from categories
    categories.forEach(category => {
      newItems[category.id] = []
    })
    setItems(newItems)
  }

  const holdItem = (categoryId: string, itemId: string) => {
    const item = items[categoryId]?.find(i => i.id === itemId)
    if (!item) return

    // Add to held items
    setHeldItems([...heldItems, {
      id: item.id,
      text: item.text,
      categoryId: categoryId,
    }])

    // Remove from category
    setItems({
      ...items,
      [categoryId]: items[categoryId].filter(i => i.id !== itemId),
    })
  }

  const unholdItem = (itemId: string, categoryId: string) => {
    const heldItem = heldItems.find(i => i.id === itemId)
    if (!heldItem) return

    // Add back to category
    setItems({
      ...items,
      [categoryId]: [...(items[categoryId] || []), {
        id: heldItem.id,
        text: heldItem.text,
      }],
    })

    // Remove from held items
    setHeldItems(heldItems.filter(i => i.id !== itemId))
  }

  const deleteHeldItem = (itemId: string) => {
    setHeldItems(heldItems.filter(i => i.id !== itemId))
  }

  const editSuggestion = (oldKey: string, newText: string, categoryId: string) => {
    const newKey = newText.toLowerCase()
    const suggestion = suggestions[oldKey]
    
    if (!suggestion) return

    // If the key changed, we need to remove old and add new
    if (oldKey !== newKey) {
      const newSuggestions = { ...suggestions }
      delete newSuggestions[oldKey]
      newSuggestions[newKey] = {
        ...suggestion,
        text: addEmojiToItem(newText),
        categoryId: categoryId,
      }
      setSuggestions(newSuggestions)
    } else {
      // Just update the text and category
      setSuggestions({
        ...suggestions,
        [oldKey]: {
          ...suggestion,
          text: addEmojiToItem(newText),
          categoryId: categoryId,
        }
      })
    }
  }

  const deleteSuggestion = (key: string) => {
    const newSuggestions = { ...suggestions }
    delete newSuggestions[key]
    setSuggestions(newSuggestions)
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    setSelectedCategoryId(null)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCurrentView('single-category')
  }

  // Get the selected category object
  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 Shopping List</h1>
        <HeaderMenu onRemoveDone={removeDoneItems} onRemoveAll={removeAllItems} />
      </header>

      <div className="app-main">
        {/* Desktop Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {categories.map((category) => {
              const remainingCount = (items[category.id] || []).filter(item => !item.done).length
              const isActive = currentView === 'single-category' && selectedCategoryId === category.id
              
              return (
                <button
                  key={category.id}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <span className="sidebar-item-name">{category.name}</span>
                  <span className="sidebar-item-count">{remainingCount}</span>
                </button>
              )
            })}
            
            {/* Add Category button in sidebar */}
            <button
              className="sidebar-item add-item"
              onClick={() => handleViewChange('categories')}
            >
              <span className="sidebar-item-name">⚙️ Manage Categories</span>
            </button>
          </nav>
        </aside>

        <DragDropContext onDragEnd={handleDragEnd}>
          {currentView === 'categories' && (
            <CategoriesView
              categories={categories}
              items={items}
              onCategoryClick={handleCategoryClick}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
            />
          )}

          {currentView === 'all-items' && (
            <AllItemsView
              categories={categories}
              items={items}
              onRemoveItem={removeItem}
              onToggleItem={toggleItemDone}
              onEditItem={editItem}
              onChangeCategory={changeItemCategory}
              onHoldItem={holdItem}
            />
          )}

          {currentView === 'suggestions' && (
            <SuggestionsView
              suggestions={suggestions}
              categories={categories}
              items={items}
              onAddSuggestion={addItem}
              onEditSuggestion={editSuggestion}
              onDeleteSuggestion={deleteSuggestion}
            />
          )}

          {currentView === 'held-items' && (
            <HeldItemsView
              heldItems={heldItems}
              categories={categories}
              onUnhold={unholdItem}
              onDelete={deleteHeldItem}
            />
          )}

          {currentView === 'single-category' && selectedCategory && (
            <SingleCategoryView
              category={selectedCategory}
              categories={categories}
              items={items[selectedCategory.id] || []}
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
        </DragDropContext>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeView={currentView === 'single-category' ? 'all-items' : currentView} onViewChange={handleViewChange} />
    </div>
  )
}

export default App
