import type { List } from '../types';
import '../styles/SwitchListModal.css';

interface SwitchListModalProps {
  lists: List[];
  activeListId: string | null;
  onSelectList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  onClose: () => void;
}

const SwitchListModal = ({ lists, activeListId, onSelectList, onDeleteList, onClose }: SwitchListModalProps) => {
  return (
    <div className="switch-list-overlay" onClick={onClose}>
      <div className="switch-list-container" onClick={(e) => e.stopPropagation()}>
        <div className="switch-list-header">
          <h2>Switch List</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="lists-container">
          {lists.map(list => (
            <div 
              key={list.id} 
              className={`list-row ${list.id === activeListId ? 'active' : ''}`}
              onClick={() => onSelectList(list.id)}
            >
              <span className="list-name">{list.name}</span>
              <div className="list-actions">
                <button 
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); onDeleteList(list.id)}}
                  disabled={list.id === activeListId} // Disable delete for active list
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwitchListModal;
