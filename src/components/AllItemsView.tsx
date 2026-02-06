import { useState } from 'react'
import ItemMenu from './ItemMenu'
import type { Category, Item } from '../types'
import '../styles/AllItemsView.css'

interface AllItemsViewProps {
  categories: Category[]
  items: Item[]
  onRemoveItem: (itemId: string) => void
  onToggleItem: (itemId: string) => void
  onEditItem: (itemId: string, newText: string, newQuantity?: number) => void
  onChangeCategory: (itemId: string, toCategoryId: string) => void
  onHoldItem: (itemId: string) => void
}

const AllItemsView = ({ categories, items, onRemoveItem, onToggleItem, onEditItem, onChangeCategory, onHoldItem }: AllItemsViewProps) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingQuantity, setEditingQuantity] = useState<number | undefined>(undefined)

  const allItems = items;

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
                        onEditItem(item.id, editingText, editingQuantity)
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
                    <input
                      type="number"
                      value={editingQuantity}
                      onChange={(e) => setEditingQuantity(parseInt(e.target.value))}
                      className="edit-quantity-input"
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
                      onClick={() => onToggleItem(item.id)}
                    >
                      <span className="item-text">{item.text} {item.quantity && `(x${item.quantity})`}</span>
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
                        setEditingQuantity(item.quantity)
                      }}
                      onChangeCategory={(categoryId) => {
                        onChangeCategory(item.id, categoryId)
                      }}
                      onDelete={() => onRemoveItem(item.id)}
                      onHold={() => onHoldItem(item.id)}
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
