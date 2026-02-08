import React, { useState } from 'react';
import type { List } from '../types';
import '../styles/SwitchListModal.css';
import '../styles/RenameListModal.css';
import RenameListModal from './RenameListModal';

interface SwitchListModalProps {
  lists: List[];
  activeListId: string | null;
  onSelectList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  onUpdateList: (listId: string, newName: string) => void;
  onClose: () => void;
}

const SwitchListModal = ({ lists, activeListId, onSelectList, onDeleteList, onUpdateList, onClose }: SwitchListModalProps) => {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [listToRename, setListToRename] = useState<List | null>(null);

  const handleRenameClick = (e: React.MouseEvent, list: List) => {
    e.stopPropagation();
    setListToRename(list);
    setShowRenameModal(true);
  };

  return (
    <>
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
                    className="rename-btn"
                    onClick={(e) => handleRenameClick(e, list)}
                  >
                    ✏️
                  </button>
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
      {showRenameModal && listToRename && (
        <RenameListModal
          list={listToRename}
          onClose={() => setShowRenameModal(false)}
          onRename={(newName) => onUpdateList(listToRename.id, newName)}
        />
      )}
    </>
  );
};

export default SwitchListModal;
