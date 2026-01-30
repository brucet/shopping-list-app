import { useState } from 'react'
import ItemMenu from './ItemMenu'
import type { Category, ItemsMap } from '../types'
import '../styles/AllItemsView.css'

interface AllItemsViewProps {
  categories: Category[]
  items: ItemsMap
  onRemoveItem: (categoryId: string, itemId: string) => void
  onToggleItem: (categoryId: string, itemId: string) => void
  onEditItem: (categoryId: string, itemId: string, newText: string) => void
  onChangeCategory: (fromCategoryId: string, itemId: string, toCategoryId: string) => void
  onHoldItem: (categoryId: string, itemId: string) => void
}

const AllItemsView = ({ categories, items, onRemoveItem, onToggleItem, onEditItem, onChangeCategory, onHoldItem }: AllItemsViewProps) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const allItems = categories.flatMap((category) =>
    (items[category.id] || []).map((item) => ({
      ...item,
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color,
    }))
  )

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.color : '#f0f0f0'
  }

  return (
    <div className="all-items-view">
      <div className="all-items-header">
        <h2>All Items</h2>
        <span className="total-count">{allItems.length} items</span>
      </div>

      {allItems.length === 0 ? (
        <div className="empty-all-items">
          <p>No items yet. Start adding items to your categories!</p>
        </div>
      ) : (
        <div className="all-items-list">
          {allItems
            .sort((a, b) => {
              if (a.done && !b.done) return 1
              if (!a.done && b.done) return -1
              return 0
            })
            .map((item) => (
              <div
                key={item.id}
                className={`all-items-item ${item.done ? 'done' : ''} ${editingItemId === item.id ? 'editing' : ''}`}
              >
                {editingItemId === item.id ? (
                  <form
                    className="item-edit-form"
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (editingText.trim()) {
                        onEditItem(item.categoryId, item.id, editingText)
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
                    <div
                      className="item-content"
                      onClick={() => onToggleItem(item.categoryId, item.id)}
                    >
                      <span className="item-text">{item.text}</span>
                      <span 
                        className="item-category-badge"
                        style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                      >
                        {categories.find(c => c.id === item.categoryId)?.name}
                      </span>
                    </div>
                    <ItemMenu
                      onEdit={() => {
                        setEditingItemId(item.id)
                        setEditingText(item.text)
                      }}
                      onChangeCategory={(categoryId) => {
                        onChangeCategory(item.categoryId, item.id, categoryId)
                      }}
                      onDelete={() => onRemoveItem(item.categoryId, item.id)}
                      onHold={() => onHoldItem(item.categoryId, item.id)}
                      categories={categories}
                      currentCategoryId={item.categoryId}
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

export default AllItemsView
