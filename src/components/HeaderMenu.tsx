import React, {useState, useRef, useEffect} from 'react'
import '../styles/HeaderMenu.css'
import {User} from 'firebase/auth';
import type {List} from '../types';
import NewListForm from './NewListForm';
import SwitchListModal from './SwitchListModal';
import ShareListModal from './ShareListModal';
import '../styles/NewListForm.css';
import '../styles/SwitchListModal.css';
import '../styles/ShareListModal.css';

interface HeaderMenuProps {
    user: User | null;
    onLogout: () => void;
    onRemoveDone: () => void;
    onRemoveAll: () => void;
    onSetupSampleData: () => void;
    hasRootData: boolean;
    onMigrateData: () => void;
    lists: List[];
    activeListId: string | null;
    onSelectList: (listId: string) => void;
    onCreateList: (name: string) => void;
    onDeleteList: (listId: string) => void;
    onUpdateList: (listId: string, newName: string) => void;
}

const HeaderMenu = ({
                        user,
                        onLogout,
                        onRemoveDone,
                        onRemoveAll,
                        onSetupSampleData,
                        hasRootData,
                        onMigrateData,
                        lists,
                        activeListId,
                        onSelectList,
                        onCreateList,
                        onDeleteList,
                        onUpdateList,
                    }: HeaderMenuProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [showNewListForm, setShowNewListForm] = useState(false);
    const [showSwitchListModal, setShowSwitchListModal] = useState(false);
    const [showShareListModal, setShowShareListModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
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
    }

    const handleAction = (action: () => void) => {
        setIsOpen(false);
        action();
    }

    const activeList = lists.find(list => list.id === activeListId);

    return (
        <>
            <div className="header-menu-container" ref={menuRef}>
                <button
                    className="header-menu-trigger"
                    onClick={handleToggleMenu}
                    title="More options"
                >
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="user-avatar"/>
                    ) : (
                        '⋮'
                    )}
                </button>

                {isOpen && (
                    <div className="header-menu-dropdown">
                        {user && <div className="user-info">Signed in as {user.displayName}</div>}

                        <div className="list-management-section">
                            <button className="header-menu-item" onClick={() => {
                                setIsOpen(false);
                                setShowSwitchListModal(true);
                            }}>
                                <span className="header-menu-icon">🔁</span>
                                Switch List
                            </button>
                            <button className="header-menu-item" onClick={() => {
                                setIsOpen(false);
                                setShowNewListForm(true);
                            }}>
                                <span className="header-menu-icon">➕</span>
                                New List
                            </button>
                            {activeList && (
                                <button className="header-menu-item" onClick={() => {
                                    setIsOpen(false);
                                    setShowShareListModal(true);
                                }}>
                                    <span className="header-menu-icon">📤</span>
                                    Share List
                                </button>
                            )}
                        </div>

                        {hasRootData && (
                            <button className="header-menu-item" onClick={() => handleAction(onMigrateData)}>
                                <span className="header-menu-icon">🔄</span>
                                Migrate Old Data
                            </button>
                        )}
                        <button className="header-menu-item" onClick={() => handleAction(onSetupSampleData)}>
                            <span className="header-menu-icon">📊</span>
                            Setup Sample Data
                        </button>
                        <button className="header-menu-item" onClick={() => handleAction(onRemoveDone)}>
                            <span className="header-menu-icon">✓</span>
                            Remove Done Items
                        </button>

                        <button className="header-menu-item danger" onClick={() => handleAction(onRemoveAll)}>
                            <span className="header-menu-icon">🗑️</span>
                            Remove All Items
                        </button>
                        <button className="header-menu-item" onClick={() => handleAction(onLogout)}>
                            <span className="header-menu-icon">➡️</span>
                            Logout
                        </button>
                    </div>
                )}
            </div>
            {showNewListForm && (
                <NewListForm
                    onCreate={onCreateList}
                    onClose={() => setShowNewListForm(false)}
                />
            )}
            {showSwitchListModal && (
                <SwitchListModal
                    lists={lists}
                    activeListId={activeListId}
                    onSelectList={(listId) => {
                        onSelectList(listId);
                        setShowSwitchListModal(false);
                    }}
                    onDeleteList={onDeleteList}
                    onUpdateList={onUpdateList}
                    onClose={() => setShowSwitchListModal(false)}
                />
            )}
            {showShareListModal && activeList && user && (
                <ShareListModal
                    list={activeList}
                    user={user}
                    onClose={() => setShowShareListModal(false)}
                />
            )}
        </>
    )
}

export default HeaderMenu
