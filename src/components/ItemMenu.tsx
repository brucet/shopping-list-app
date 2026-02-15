import React, {useState, useRef, useEffect} from 'react'
import type {Category} from '../types'
import '../styles/ItemMenu.css'

interface ItemMenuProps {
    onEdit: () => void;
    onChangeCategory: (categoryId: string) => void;
    onDelete: () => void;
    onHold: () => void;
    categories: Category[];
    currentCategoryId: string;
}

const ItemMenu = ({onEdit, onChangeCategory, onDelete, onHold, categories, currentCategoryId}: ItemMenuProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [showCategoryMenu, setShowCategoryMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setShowCategoryMenu(false)
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
        setShowCategoryMenu(false)
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(false)
        onEdit()
    }

    const handleHold = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(false)
        onHold()
    }

    const handleShowCategoryMenu = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowCategoryMenu(!showCategoryMenu)
    }

    const handleChangeCategory = (categoryId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(false)
        setShowCategoryMenu(false)
        onChangeCategory(categoryId)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(false)
        onDelete()
    }

    return (
        <div className="item-menu-container" ref={menuRef}>
            <button className="item-menu-trigger" onClick={handleToggleMenu} title="More options">⋮</button>

            {isOpen && (
                <div className="item-menu-dropdown">
                    <button className="menu-item" onClick={handleEdit}>
                        <span className="menu-icon">✏️</span>Edit
                    </button>

                    <button className="menu-item" onClick={handleHold}>
                        <span className="menu-icon">⏸️</span>Hold Item
                    </button>

                    {categories && categories.length > 1 && (
                        <div className="menu-item-with-submenu">
                            <button className="menu-item" onClick={handleShowCategoryMenu}>
                                <span className="menu-icon">📁</span>Change Category
                                <span className="submenu-arrow">›</span>
                            </button>

                            {showCategoryMenu && (
                                <div className="submenu-dropdown">
                                    {categories
                                        .filter(cat => cat.id !== currentCategoryId)
                                        .map(category => (
                                            <button
                                                key={category.id}
                                                className="submenu-item"
                                                onClick={(e) => handleChangeCategory(category.id, e)}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button className="menu-item delete" onClick={handleDelete}>
                        <span className="menu-icon">🗑️</span>Delete
                    </button>
                </div>
            )}
        </div>
    )
}

export default ItemMenu
