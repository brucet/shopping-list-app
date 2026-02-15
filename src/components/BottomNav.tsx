import type {ViewType} from '../types'
import '../styles/BottomNav.css'

interface BottomNavProps {
    activeView: ViewType
    onViewChange: (view: ViewType) => void
}

const BottomNav = ({activeView, onViewChange}: BottomNavProps) => {
    return (
        <nav className="bottom-nav">
            {/* Categories tab only shows on mobile */}
            <button
                className={`nav-item nav-item-categories ${activeView === 'categories' ? 'active' : ''}`}
                onClick={() => onViewChange('categories')}
            >
                <span className="nav-icon">📁</span>
                <span className="nav-label">Categories</span>
            </button>
            <button
                className={`nav-item ${activeView === 'all-items' ? 'active' : ''}`}
                onClick={() => onViewChange('all-items')}
            >
                <span className="nav-icon">📋</span>
                <span className="nav-label">All Items</span>
            </button>
            <button
                className={`nav-item ${activeView === 'suggestions' ? 'active' : ''}`}
                onClick={() => onViewChange('suggestions')}
            >
                <span className="nav-icon">💡</span>
                <span className="nav-label">Suggestions</span>
            </button>
            <button
                className={`nav-item ${activeView === 'held-items' ? 'active' : ''}`}
                onClick={() => onViewChange('held-items')}
            >
                <span className="nav-icon">⏸️</span>
                <span className="nav-label">Held</span>
            </button>
            <button
                className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
                onClick={() => onViewChange('history')}
            >
                <span className="nav-icon">📖</span>
                <span className="nav-label">History</span>
            </button>
            <button
                className={`nav-item ${activeView === 'invitations' ? 'active' : ''}`}
                onClick={() => onViewChange('invitations')}
            >
                <span className="nav-icon">✉️</span>
                <span className="nav-label">Invitations</span>
            </button>
        </nav>
    )
}

export default BottomNav
