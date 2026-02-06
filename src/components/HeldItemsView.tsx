import type { Category, HeldItem } from '../types'
import '../styles/HeldItemsView.css'
import HeldLineItem from './HeldLineItem'

interface HeldItemsViewProps {
  heldItems: HeldItem[]
  categories: Category[]
  onUnhold: (itemId: string, categoryId: string) => void
  onDelete: (itemId: string) => void
  onEditItem: (itemId: string, newText: string, newQuantity?: number) => void
}

const HeldItemsView = ({ heldItems, categories, onUnhold, onDelete, onEditItem }: HeldItemsViewProps) => {

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
            <HeldLineItem
              key={item.id}
              item={item}
              categories={categories}
              onUnhold={onUnhold}
              onDelete={onDelete}
              onEditItem={onEditItem}
              className="held-item"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HeldItemsView
