import { useState, useRef, useEffect } from 'react'

interface CategoryCardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  itemCount: number;
}

function CategoryCardMenu({ onEdit, onDelete, itemCount }: CategoryCardMenuProps) {
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
            <span className="menu-icon">✏️</span>Edit name
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

export default CategoryCardMenu
