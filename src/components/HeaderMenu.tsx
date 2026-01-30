import React, { useState, useRef, useEffect } from 'react'
import '../styles/HeaderMenu.css'

interface HeaderMenuProps {
  onRemoveDone: () => void
  onRemoveAll: () => void
}

const HeaderMenu = ({ onRemoveDone, onRemoveAll }: HeaderMenuProps) => {
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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleRemoveDone = () => {
    setIsOpen(false)
    onRemoveDone()
  }

  const handleRemoveAll = () => {
    setIsOpen(false)
    onRemoveAll()
  }

  return (
    <div className="header-menu-container" ref={menuRef}>
      <button 
        className="header-menu-trigger"
        onClick={handleToggleMenu}
        title="More options"
      >
        ⋮
      </button>

      {isOpen && (
        <div className="header-menu-dropdown">
          <button className="header-menu-item" onClick={handleRemoveDone}>
            <span className="header-menu-icon">✓</span>
            Remove Done Items
          </button>
          
          <button className="header-menu-item danger" onClick={handleRemoveAll}>
            <span className="header-menu-icon">🗑️</span>
            Remove All Items
          </button>
        </div>
      )}
    </div>
  )
}

export default HeaderMenu
