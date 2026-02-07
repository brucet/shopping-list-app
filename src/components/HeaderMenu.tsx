import React, { useState, useRef, useEffect } from 'react'
import '../styles/HeaderMenu.css'
import { User } from 'firebase/auth';

interface HeaderMenuProps {
  user: User | null;
  onLogout: () => void;
  onRemoveDone: () => void
  onRemoveAll: () => void
  onSetupSampleData: () => void
}

const HeaderMenu = ({ user, onLogout, onRemoveDone, onRemoveAll, onSetupSampleData }: HeaderMenuProps) => {
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

  const handleSetupSampleData = () => {
    setIsOpen(false)
    onSetupSampleData()
  }

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  }

  return (
    <div className="header-menu-container" ref={menuRef}>
      <button 
        className="header-menu-trigger"
        onClick={handleToggleMenu}
        title="More options"
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt="User" className="user-avatar" />
        ) : (
          '⋮'
        )}
      </button>

      {isOpen && (
        <div className="header-menu-dropdown">
          {user && <div className="user-info">Signed in as {user.displayName}</div>}
          <button className="header-menu-item" onClick={handleSetupSampleData}>
            <span className="header-menu-icon">📊</span>
            Setup Sample Data
          </button>
          <button className="header-menu-item" onClick={handleRemoveDone}>
            <span className="header-menu-icon">✓</span>
            Remove Done Items
          </button>
          
          <button className="header-menu-item danger" onClick={handleRemoveAll}>
            <span className="header-menu-icon">🗑️</span>
            Remove All Items
          </button>
          <button className="header-menu-item" onClick={handleLogout}>
            <span className="header-menu-icon">➡️</span>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default HeaderMenu