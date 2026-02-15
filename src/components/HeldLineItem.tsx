import {useState, useRef, useEffect} from 'react'
import type {Category, HeldItem} from '../types'
import '../styles/HeldItemsView.css'
import '../styles/Item.css' // Assuming some shared item styles

interface HeldLineItemProps {
    item: HeldItem;
    categories: Category[];
    onUnhold: (itemId: string, categoryId: string) => void;
    onDelete: (itemId: string) => void;
    onEditItem: (itemId: string, newText: string, newQuantity?: string) => void;
    className?: string; // Optional className for the root div
}

const HeldLineItem = ({item, categories, onUnhold, onDelete, onEditItem, className}: HeldLineItemProps) => {
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
        onEditItem(itemId, currentText, inlineQuantityValue);
        setEditingInlineQuantityId(null);
        setInlineQuantityValue('');
    };

    const getCategoryName = (categoryId: string): string => {
        const category = categories.find(c => c.id === categoryId)
        return category ? category.name : 'Unknown'
    }


    return (
        <div key={item.id} className={`${className} ${editingItemId === item.id ? 'editing' : ''}`}>
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
                    <div className="held-item-content">
            <span className="held-item-text">
              {item.quantity ? (
                  <span className="item-quantity">{item.quantity} </span>
              ) : (
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
                          className="item-quantity"
                          onClick={(e) => {
                              e.stopPropagation(); // prevent toggling 'done'
                              setEditingInlineQuantityId(item.id);
                              setInlineQuantityValue(item.quantity?.toString() || '');
                          }}
                      >
                    #
                  </span>
                  )
              )}
                {item.text}
            </span>
                        <span
                            className="held-item-category"

                        >
              {getCategoryName(item.categoryId)}
            </span>
                    </div>
                    <div className="held-item-actions">
                        <button
                            className="unhold-btn"
                            onClick={() => onUnhold(item.id, item.categoryId)}
                            title="Put back in category"
                        >
                            ↩️
                        </button>
                        <button
                            className="delete-held-btn"
                            onClick={() => onDelete(item.id)}
                            title="Delete held item"
                        >
                            ✕
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default HeldLineItem;
