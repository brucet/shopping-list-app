import React, {useState} from 'react'
import type {Category, Item} from '../types'
import '../styles/CategoriesView.css'


interface CategoriesViewProps {
  categories: Category[]
  items: Item[]
  onCategoryClick: (categoryId: string) => void
  onUpdateCategory: (id: string, name: string) => void
  onDeleteCategory: (id: string) => void

}

export default function CategoriesView({ categories, items, onCategoryClick, onUpdateCategory }: CategoriesViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const [hideEmpty, setHideEmpty] = useState(false)

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editName.trim() && editingId) {
      onUpdateCategory(editingId, editName.trim())
      setEditingId(null)
    }
  }

  const cancelEdit = () => setEditingId(null)

  return (
    <div className="categories-view">
      <div className="categories-view-header">
        <h2>Categories</h2>
        <label className="hide-empty-toggle">
          <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
          <span>Hide Empty</span>
        </label>
      </div>

      <div className="categories-grid">
        {categories.map((category) => {
          const categoryItems = items.filter(item => item.categoryId === category.id)
          const remainingCount = categoryItems.filter(item => !item.done).length
          const isEditing = editingId === category.id

          if (hideEmpty && remainingCount === 0) return null

          return (
            <div key={category.id} className={`category-card ${isEditing ? 'editing' : ''}`}>
              {isEditing ? (
                <form className="category-edit-form" onSubmit={saveEdit} onClick={(e) => e.stopPropagation()}>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="category-input" autoFocus />

                  <div className="edit-actions">
                    <button type="submit" className="save-btn">✓</button>
                    <button type="button" className="cancel-btn" onClick={cancelEdit}>✕</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="category-card-drag-handle"><span className="drag-indicator">⋮⋮</span></div>
                  <div className="category-card-content" onClick={() => onCategoryClick(category.id)}>
                    <div className="category-title-row">
                      <h3>{category.name}</h3>
                    </div>
                    {remainingCount > 0 ? (
                      <span className="count-lozenge">{remainingCount}</span>
                    ) : (
                      <span className="stat-text empty">Empty</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
