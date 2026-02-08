import React, { useState } from 'react';
import '../styles/NewListForm.css';

interface NewListFormProps {
  onCreate: (name: string) => void;
  onClose: () => void;
}

const NewListForm = ({ onCreate, onClose }: NewListFormProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      onClose();
    }
  };

  return (
    <div className="new-list-form-overlay" onClick={onClose}>
      <div className="new-list-form-container" onClick={(e) => e.stopPropagation()}>
        <h2>Create New List</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="List name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewListForm;
