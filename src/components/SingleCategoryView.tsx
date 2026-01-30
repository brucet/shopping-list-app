import React, { useState } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import ItemMenu from './ItemMenu'
import type { Category, Item, SuggestionsMap } from '../types'
import '../styles/SingleCategoryView.css'

interface SingleCategoryViewProps {
  category: Category
  categories: Category[]
  items: Item[]
  suggestions: SuggestionsMap
  onAddItem: (categoryId: string, text: string) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
  onToggleItem: (categoryId: string, itemId: string) => void
  onEditItem: (categoryId: string, itemId: string, newText: string) => void
  onChangeCategory: (fromCategoryId: string, itemId: string, toCategoryId: string) => void
  onHoldItem: (categoryId: string, itemId: string) => void
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const getMatchingSuggestions = () => {
    if (!inputValue.trim() || !showSuggestions) return []
    
    const query = inputValue.trim().toLowerCase()
    return Object.entries(suggestions)
      .filter(([key]) => key.startsWith(query))
      .map(([, suggestion]) => suggestion)
      .slice(0, 5)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddItem(category.id, inputValue)
    setInputValue('')
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

      <Droppable droppableId={category.id} type="ITEM">
        {(provided, snapshot) => (
          <div
            className={`single-category-items ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items.length === 0 ? (
              <p className="empty-state">No items yet</p>
            ) : (
              items
                .sort((a, b) => {
                  if (a.done && !b.done) return 1
                  if (!a.done && b.done) return -1
                  return 0
                })
                .map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`single-item ${item.done ? 'done' : ''} ${
                          snapshot.isDragging ? 'dragging' : ''
                        } ${editingItemId === item.id ? 'editing' : ''}`}
                      >
                        {editingItemId === item.id ? (
                          <form
                            className="item-edit-form"
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={(e) => {
                              e.preventDefault()
                              if (editingText.trim()) {
                                onEditItem(category.id, item.id, editingText)
                              }
                              setEditingItemId(null)
                            }}
                          >
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              autoFocus
                              className="edit-input"
                            />
                            <button type="submit" className="edit-save-btn">✓</button>
                            <button
                              type="button"
                              className="edit-cancel-btn"
                              onClick={() => setEditingItemId(null)}
                            >
                              ✕
                            </button>
                          </form>
                        ) : (
                          <>
                            <span 
                              className="item-text"
                              onClick={() => onToggleItem(category.id, item.id)}
                            >
                              {item.text}
                            </span>
                            <ItemMenu
                              onEdit={() => {
                                setEditingItemId(item.id)
                                setEditingText(item.text)
                              }}
                              onChangeCategory={(categoryId) => {
                                onChangeCategory(category.id, item.id, categoryId)
                              }}
                              onDelete={() => onRemoveItem(category.id, item.id)}
                              onHold={() => onHoldItem(category.id, item.id)}
                              categories={categories}
                              currentCategoryId={category.id}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

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
