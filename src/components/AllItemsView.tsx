import { useState, useRef, useEffect } from 'react'
import ItemMenu from './ItemMenu'
import type { Category, Item } from '../types'
import '../styles/AllItemsView.css'
import '../styles/Item.css'

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

  const [editingInlineQuantityId, setEditingInlineQuantityId] = useState<string | null>(null);
  const [inlineQuantityValue, setInlineQuantityValue] = useState<string>('');
  const inlineQuantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingInlineQuantityId && inlineQuantityInputRef.current) {
      inlineQuantityInputRef.current.focus();
    }
  }, [editingInlineQuantityId]);

  const handleInlineQuantitySubmit = (itemId: string, currentText: string) => {
    const newQuantity = parseInt(inlineQuantityValue, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onEditItem(itemId, currentText, newQuantity);
    } else {
      onEditItem(itemId, currentText, undefined); // Remove quantity if invalid or empty
    }
    setEditingInlineQuantityId(null);
    setInlineQuantityValue('');
  };

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
                        onEditItem(item.id, editingText)
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
                      onClick={() => onToggleItem(item.id)}
                    >
                      <span className="item-text">
                        {
                          editingInlineQuantityId === item.id ? (
                            <input
                              ref={inlineQuantityInputRef}
                              className="item-quantity-inline-input"
                              value={inlineQuantityValue}
                              onChange={(e) => setInlineQuantityValue(e.target.value)}
                              onBlur={() => handleInlineQuantitySubmit(item.id, item.text)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleInlineQuantitySubmit(item.id, item.text);
                                } else if (e.key === 'Escape') {
                                  setEditingInlineQuantityId(null);
                                  setInlineQuantityValue('');
                                }
                              }}
                              onClick={(e) => e.stopPropagation()} // Prevent toggling 'done'
                            />
                          ) : (
                            <span
                              className={item.quantity ? "item-quantity" : "item-quantity-placeholder"}
                              onClick={(e) => {
                                e.stopPropagation(); // prevent toggling 'done'
                                setEditingInlineQuantityId(item.id);
                                setInlineQuantityValue(item.quantity?.toString() || '');
                              }}
                            >
                              {item.quantity || '#'}
                            </span>
                          )
                        }
                        {item.text}
                      </span>
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
