import React, { useState } from 'react';
import { List } from '../types';
import '../styles/RenameListModal.css';

interface RenameListModalProps {
  list: List;
  onClose: () => void;
  onRename: (newName: string) => void;
}

const RenameListModal: React.FC<RenameListModalProps> = ({ list, onClose, onRename }) => {
  const [name, setName] = useState(list.name);

  const handleRename = () => {
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  return (
    <div className="rename-list-modal-overlay">
      <div className="rename-list-modal">
        <h2>Rename "{list.name}"</h2>
        <div className="rename-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleRename}>Rename</button>
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default RenameListModal;
