import type {Category, Item} from '../types'
import '../styles/AllItemsView.css'
import '../styles/Item.css'
import LineItem from './LineItem';

interface AllItemsViewProps {
    categories: Category[]
    items: Item[]
    onRemoveItem: (itemId: string) => void
    onToggleItem: (itemId: string) => void
    onEditItem: (itemId: string, newText: string, newQuantity?: string) => void
    onChangeCategory: (itemId: string, toCategoryId: string) => void
    onHoldItem: (itemId: string) => void
}

const AllItemsView = ({
                          categories,
                          items,
                          onRemoveItem,
                          onToggleItem,
                          onEditItem,
                          onChangeCategory,
                          onHoldItem
                      }: AllItemsViewProps) => {

    const allItems = items;

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
                            return (a.createdAt || 0) - (b.createdAt || 0)
                        })
                        .map((item) => (
                            <LineItem
                                key={item.id}
                                item={item}
                                categories={categories}
                                onRemoveItem={onRemoveItem}
                                onToggleItem={onToggleItem}
                                onEditItem={onEditItem}
                                onChangeCategory={onChangeCategory}
                                onHoldItem={onHoldItem}
                            />
                        ))}
                </div>
            )}
        </div>
    )
}


export default AllItemsView
