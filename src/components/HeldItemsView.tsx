import type { Category, HeldItem } from '../types'
import '../styles/HeldItemsView.css'

interface HeldItemsViewProps {
  heldItems: HeldItem[]
  categories: Category[]
  onUnhold: (itemId: string, categoryId: string) => void
  onDelete: (itemId: string) => void
}

const HeldItemsView = ({ heldItems, categories, onUnhold, onDelete }: HeldItemsViewProps) => {
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Unknown'
  }

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.color : '#f0f0f0'
  }

  return (
    <div className="held-items-view">
      <div className="held-items-header">
        <h2>Held Items</h2>
        <span className="held-count">{heldItems.length} items</span>
      </div>

      {heldItems.length === 0 ? (
        <div className="empty-held-items">
          <p>No held items. Use the ⏸️ Hold Item option to temporarily pause items.</p>
        </div>
      ) : (
        <div className="held-items-list">
          {heldItems.map((item) => (
            <div key={item.id} className="held-item">
              <div className="held-item-content">
                <span className="held-item-text">{item.text}</span>
                <span 
                  className="held-item-category"
                  style={{ backgroundColor: getCategoryColor(item.categoryId) }}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HeldItemsView
