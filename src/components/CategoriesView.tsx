import React, { useState, useRef, useEffect } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import type { Category, ItemsMap } from '../types'
import '../styles/CategoriesView.css'

const PRESET_COLORS = [
  '#E8F5E9', '#F3E5F5', '#FFEBEE', '#FFF3E0', '#E0F2F1',
  '#FCE4EC', '#F1F8E9', '#E3F2FD',
]

interface CategoriesViewProps {
  categories: Category[]
  items: ItemsMap
  onCategoryClick: (categoryId: string) => void
  onAddCategory: (name: string, color: string) => void
  onUpdateCategory: (id: string, name: string, color: string) => void
  onDeleteCategory: (id: string) => void
}

function CategoryCardMenu({ onEdit, onDelete, itemCount }: { onEdit: () => void; onDelete: () => void; itemCount: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="category-menu-container" ref={menuRef}>
      <button className="category-menu-trigger" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }} title="More options">⋮</button>
      {isOpen && (
        <div className="category-menu-dropdown">
          <button className="menu-item" onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit() }}>
            <span className="menu-icon">✏️</span>Edit
          </button>
          {itemCount === 0 && (
            <button className="menu-item delete" onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete() }}>
              <span className="menu-icon">🗑️</span>Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function CategoriesView({ categories, items, onCategoryClick, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoriesViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [hideEmpty, setHideEmpty] = useState(false)

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      onAddCategory(newName.trim(), newColor)
      setNewName('')
      setNewColor(PRESET_COLORS[0])
      setShowAddForm(false)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditColor(category.color)
  }

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editName.trim() && editingId) {
      onUpdateCategory(editingId, editName.trim(), editColor)
      setEditingId(null)
    }
  }

  const cancelEdit = () => setEditingId(null)

  const handleDelete = (categoryId: string) => {
    if (confirm('Delete this category?')) {
      onDeleteCategory(categoryId)
    }
  }

  return (
    <div className="categories-view">
      <div className="categories-view-header">
        <h2>Categories</h2>
        <label className="hide-empty-toggle">
          <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
          <span>Hide Empty</span>
        </label>
      </div>

      {showAddForm && (
        <form className="add-category-form" onSubmit={handleAddCategory}>
          <input type="text" placeholder="Category name" value={newName} onChange={(e) => setNewName(e.target.value)} className="category-input" autoFocus />
          <div className="color-picker-inline">
            {PRESET_COLORS.map((color) => (
              <button key={color} type="button" className={`color-option ${newColor === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setNewColor(color)} />
            ))}
          </div>
          <button type="submit" className="save-category-btn">Add</button>
        </form>
      )}

      <Droppable droppableId="categories" type="CATEGORY">
        {(provided, snapshot) => (
          <div className={`categories-grid ${snapshot.isDraggingOver ? 'dragging-over' : ''}`} ref={provided.innerRef} {...provided.droppableProps}>
            {categories.map((category, index) => {
              const itemCount = (items[category.id] || []).length
              const remainingCount = (items[category.id] || []).filter(item => !item.done).length
              const isEditing = editingId === category.id

              if (hideEmpty && remainingCount === 0) return null

              return (
                <Draggable key={category.id} draggableId={category.id} index={index}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className={`category-card ${snapshot.isDragging ? 'dragging' : ''} ${isEditing ? 'editing' : ''}`} style={{ ...provided.draggableProps.style, backgroundColor: isEditing ? '#f0f7ff' : category.color }}>
                      {isEditing ? (
                        <form className="category-edit-form" onSubmit={saveEdit} onClick={(e) => e.stopPropagation()}>
                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="category-input" autoFocus />
                          <div className="color-picker-inline">
                            {PRESET_COLORS.map((color) => (
                              <button key={color} type="button" className={`color-option ${editColor === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setEditColor(color)} />
                            ))}
                          </div>
                          <div className="edit-actions">
                            <button type="submit" className="save-btn">✓</button>
                            <button type="button" className="cancel-btn" onClick={cancelEdit}>✕</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="category-card-drag-handle" {...provided.dragHandleProps}><span className="drag-indicator">⋮⋮</span></div>
                          <div className="category-card-content" onClick={() => onCategoryClick(category.id)}>
                            <div className="category-title-row">
                              <h3>{category.name}</h3>
                              {remainingCount > 0 ? (
                                <span className="count-lozenge">{remainingCount}</span>
                              ) : (
                                <span className="stat-text empty">Empty</span>
                              )}
                              <CategoryCardMenu onEdit={() => startEdit(category)} onDelete={() => handleDelete(category.id)} itemCount={itemCount} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}

            {showAddForm ? (
              <div className="category-card add-category-card">
                <form className="category-edit-form" onSubmit={handleAddCategory}>
                  <input type="text" placeholder="Category name" value={newName} onChange={(e) => setNewName(e.target.value)} className="category-input" autoFocus />
                  <div className="color-picker-inline">
                    {PRESET_COLORS.map((color) => (
                      <button key={color} type="button" className={`color-option ${newColor === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setNewColor(color)} />
                    ))}
                  </div>
                  <div className="edit-actions">
                    <button type="submit" className="save-btn">✓</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>✕</button>
                  </div>
                </form>
              </div>
            ) : (
              <button className="category-card add-category-placeholder" onClick={() => setShowAddForm(true)}>
                <span className="add-icon">+</span>
                <span className="add-label">Add Category</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
