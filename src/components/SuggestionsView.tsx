import React, { useState } from 'react'
import type { Category, ItemsMap, SuggestionsMap } from '../types'
import '../styles/SuggestionsView.css'

interface SuggestionsViewProps {
  suggestions: SuggestionsMap
  categories: Category[]
  items: ItemsMap
  onAddSuggestion: (categoryId: string, text: string) => void
  onEditSuggestion: (oldKey: string, newText: string, categoryId: string) => void
  onDeleteSuggestion: (key: string) => void
}

function SuggestionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="suggestion-menu-container" ref={menuRef}>
      <button className="suggestion-menu-trigger" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }} title="More options">⋮</button>
      {isOpen && (
        <div className="suggestion-menu-dropdown">
          <button className="menu-item" onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit() }}>
            <span className="menu-icon">✏️</span>Edit
          </button>
          <button className="menu-item delete" onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete() }}>
            <span className="menu-icon">🗑️</span>Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function SuggestionsView({ suggestions, categories, items, onAddSuggestion, onEditSuggestion, onDeleteSuggestion }: SuggestionsViewProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')

  const getSuggestionScore = (suggestion: { frequency: number; lastAdded: number }) => {
    const now = Date.now()
    const daysSinceAdded = (now - suggestion.lastAdded) / (1000 * 60 * 60 * 24)
    const recencyScore = Math.max(0, 10 - daysSinceAdded)
    const frequencyScore = suggestion.frequency * 2
    return frequencyScore + recencyScore
  }

  const itemsInList = new Set<string>()
  Object.values(items).forEach(categoryItems => {
    categoryItems.forEach(item => {
      const textWithoutEmoji = item.text.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').toLowerCase()
      itemsInList.add(textWithoutEmoji)
      itemsInList.add(item.text.toLowerCase())
    })
  })

  const sortedSuggestions = Object.entries(suggestions)
    .map(([key, data]) => ({
      key,
      ...data,
      score: getSuggestionScore(data)
    }))
    .filter(suggestion => !itemsInList.has(suggestion.key))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Unknown'
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.color : '#f0f0f0'
  }

  const formatLastAdded = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (days === 0) {
      if (hours === 0) return 'Today'
      return `${hours}h ago`
    }
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  return (
    <div className="suggestions-view">
      <div className="suggestions-header">
        <h2>Suggestions</h2>
        <span className="suggestions-count">{sortedSuggestions.length} items</span>
      </div>

      {sortedSuggestions.length === 0 ? (
        <div className="empty-suggestions">
          <p>No suggestions yet. Add items to your shopping list to see smart suggestions based on your shopping habits!</p>
        </div>
      ) : (
        <div className="suggestions-list">
          {sortedSuggestions.map((suggestion) => (
            <div
              key={suggestion.key}
              className={`suggestion-item ${editingKey === suggestion.key ? 'editing' : ''}`}
            >
              {editingKey === suggestion.key ? (
                <form
                  className="suggestion-edit-form"
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (editText.trim() && editCategoryId) {
                      const textWithoutEmoji = editText.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').trim()
                      onEditSuggestion(suggestion.key, textWithoutEmoji, editCategoryId)
                    }
                    setEditingKey(null)
                  }}
                >
                  <div className="edit-form-fields">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                      placeholder="Item name"
                      autoFocus
                    />
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="edit-category-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="edit-actions">
                    <button type="submit" className="save-btn">✓</button>
                    <button type="button" className="cancel-btn" onClick={() => setEditingKey(null)}>✕</button>
                  </div>
                </form>
              ) : (
                <>
                  <div 
                    className="suggestion-content"
                    onClick={() => onAddSuggestion(suggestion.categoryId, suggestion.text)}
                  >
                    <span className="suggestion-text">{suggestion.text}</span>
                    <div className="suggestion-meta">
                      <span 
                        className="suggestion-category"
                        style={{ backgroundColor: getCategoryColor(suggestion.categoryId) }}
                      >
                        {getCategoryName(suggestion.categoryId)}
                      </span>
                      <span className="suggestion-stats">
                        Added {suggestion.frequency}x • {formatLastAdded(suggestion.lastAdded)}
                      </span>
                    </div>
                  </div>
                  <SuggestionMenu
                    onEdit={() => {
                      const textWithoutEmoji = suggestion.text.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '')
                      setEditingKey(suggestion.key)
                      setEditText(textWithoutEmoji)
                      setEditCategoryId(suggestion.categoryId)
                    }}
                    onDelete={() => {
                      if (confirm(`Delete "${suggestion.text}" from suggestions?`)) {
                        onDeleteSuggestion(suggestion.key)
                      }
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
