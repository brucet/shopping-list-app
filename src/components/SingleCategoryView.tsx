import React, { useState } from 'react'
import type { Category, Item, SuggestionsMap } from '../types'
import '../styles/SingleCategoryView.css'
import '../styles/Item.css'
import LineItem from './LineItem'

interface SingleCategoryViewProps {
  category: Category
  categories: Category[]
  items: Item[]
  suggestions: SuggestionsMap
  onAddItem: (categoryId: string, text: string, quantity?: string) => void
  onRemoveItem: (itemId: string) => void
  onToggleItem: (itemId: string) => void
  onEditItem: (itemId: string, newText: string, newQuantity?: string) => void
  onChangeCategory: (itemId: string, toCategoryId: string) => void
  onHoldItem: (itemId: string) => void
  onBack: () => void
}

export default function SingleCategoryView({
  category,
  categories,
  items,
  suggestions,
  onAddItem,
  onRemoveItem,
  onToggleItem,
  onEditItem,
  onChangeCategory,
  onHoldItem,
  onBack,
}: SingleCategoryViewProps) {
  const [inputValue, setInputValue] = useState('')
  const [quantity, setQuantity] = useState<string | undefined>(undefined)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const getMatchingSuggestions = () => {
    if (!inputValue.trim() || !showSuggestions) return []
    
    const query = inputValue.trim().toLowerCase()
    const existingItems = new Set(items.map(item => item.text.toLowerCase()))

    return Object.entries(suggestions)
      .filter(([key]) => key.startsWith(query))
      .map(([, suggestion]) => suggestion)
      .filter(suggestion => !existingItems.has(suggestion.text.toLowerCase()))
      .slice(0, 5)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddItem(category.id, inputValue, quantity)
    setInputValue('')
    setQuantity(undefined)
  }

  return (
    <div className="single-category-view">
      <div className="single-category-header" style={{ backgroundColor: category.color }}>
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="category-info">
          <h2>{category.name}</h2>
          <span className="item-count">{items.filter(i => !i.done).length} items</span>
        </div>
      </div>

      <div className="single-category-items">
        {items.length === 0 ? (
          <p className="empty-state">No items yet</p>
        ) : (
          items
            .sort((a, b) => {
              if (a.done && !b.done) return 1
              if (!a.done && b.done) return -1
              return (a.createdAt || 0) - (b.createdAt || 0)
            })
            .map((item) => (
              <LineItem
                key={item.id}
                item={item}
                categories={categories}
                onRemoveItem={onRemoveItem}
                onToggleItem={onToggleItem}
                onEditItem={onEditItem}
                onChangeCategory={onChangeCategory}
                onHoldItem={onHoldItem}
                className="single-item"
              />
            )))}
        </div>
      <div className="single-category-add-wrapper">
        <form className="single-category-add-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Add item..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="add-item-input"
          />
          <input
            placeholder="#"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="add-quantity-input"
          />
          <button type="submit" className="add-item-btn">
            Add Item
          </button>
        </form>
        
        {showSuggestions && getMatchingSuggestions().length > 0 && (
          <div className="autocomplete-dropdown">
            {getMatchingSuggestions().map((suggestion) => (
              <button
                key={suggestion.text}
                type="button"
                className="autocomplete-item"
                onClick={() => {
                  setInputValue(suggestion.text)
                  setShowSuggestions(false)
                }}
              >
                <span className="autocomplete-text">{suggestion.text}</span>
                <span className="autocomplete-frequency">{suggestion.frequency}x</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

