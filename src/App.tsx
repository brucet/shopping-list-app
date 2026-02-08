import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import debounce from 'lodash.debounce';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  collectionGroup,
  where
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { onAuthStateChanged, User } from 'firebase/auth';
import Login from './components/Login';
import BottomNav from './components/BottomNav'
import HeaderMenu from './components/HeaderMenu'
import CategoriesView from './components/CategoriesView'
import AllItemsView from './components/AllItemsView'
import SuggestionsView from './components/SuggestionsView'
import HeldItemsView from './components/HeldItemsView'
import SingleCategoryView from './components/SingleCategoryView'
import HistoryView from './components/HistoryView';
import InvitationsView from './components/InvitationsView';
import { getInvitations, acceptInvitation as acceptInvitationService, declineInvitation as declineInvitationService } from './services/list-sharing';
import { addEmojiToItem } from './utils/emojiMatcher'
import { parseItemText } from './utils/itemParser';
import type { Category, Item, SuggestionsMap, HeldItem, ViewType, List, ListInvite } from './types'
import './App.css'
import './styles/Login.css';

const PRESET_COLORS = [
  '#E8F5E9', '#F3E5F5', '#FFEBEE', '#FFF3E0', '#E0F2F1',
  '#FCE4EC', '#F1F8E9', '#E3F2FD',
]

function SortableCategoryItem(props: {
  id: string,
  category: Category,
  items: Item[],
  currentView: ViewType,
  selectedCategoryId: string | null,
  handleCategoryClick: (categoryId: string) => void
}) {
  let {id, category, items, currentView, selectedCategoryId, handleCategoryClick} = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const remainingCount = items.filter(item => item.categoryId === category.id && !item.done).length
  const isActive = currentView === 'single-category' && selectedCategoryId === category.id

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        <button
          className={`sidebar-item ${isActive ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category.id)}
        >
          <div className="sidebar-item-left">
            <div className="sidebar-drag-handle" {...listeners}>
              <span className="drag-indicator">⋮⋮</span>
            </div>
            <span className="sidebar-item-name">{category.name}</span>
          </div>
          <span className="sidebar-item-count">{remainingCount}</span>
        </button>
    </div>
  );
}


const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<List[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [heldItems, setHeldItems] = useState<HeldItem[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionsMap>({})
  const [invitations, setInvitations] = useState<ListInvite[]>([])
  const [currentView, setCurrentView] = useState<ViewType>('categories')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const [showInlineAddCategoryForm, setShowInlineAddCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0])
  const [hasRootData, setHasRootData] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkRootData = async () => {
      if (!user) return;
      const collections = ["categories", "items", "suggestions", "heldItems", "backups"];
      for (const coll of collections) {
        const snapshot = await getDocs(query(collection(db, coll)));
        if (!snapshot.empty) {
          setHasRootData(true);
          return;
        }
      }
    };
    checkRootData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getInvitations(user).then(setInvitations);
  }, [user]);

  // Fetch lists
  useEffect(() => {
    if (!user || !user.email) return;
  
    const q = query(collectionGroup(db, 'lists'), where('memberUids', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userLists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
      
      if (userLists.length === 0 && !activeListId) {
        const newListRef = doc(collection(db, "users", user.uid, "lists"));
        const newList: List = {
          id: newListRef.id,
          name: "My First List",
          createdAt: Date.now(),
          lastOpened: Date.now(),
          members: [{ uid: user.uid, email: user.email as string, role: 'owner' }],
          memberUids: [user.uid],
        };
        setDoc(newListRef, newList);
        setLists([newList]);
        setActiveListId(newList.id);
        return;
      }

      userLists.sort((a, b) => b.lastOpened - a.lastOpened);
      setLists(userLists);
      if (!activeListId && userLists.length > 0) {
        setActiveListId(userLists[0].id);
      }
    });
  
    return () => unsubscribe();
  }, [user, activeListId]);

  // Firestore listeners for active list
  useEffect(() => {
    if (!user || !activeListId) {
      setCategories([]);
      setItems([]);
      setHeldItems([]);
      setSuggestions({});
      return;
    }

    const activeList = lists.find(l => l.id === activeListId);
    if (!activeList) return;

    const owner = activeList.members.find(m => m.role === 'owner');
    if (!owner) return;

    const listeners = [
      onSnapshot(query(collection(db, "users", owner.uid, "lists", activeListId, "categories"), orderBy("order")), (snapshot) => {
        setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category)));
      }),
      onSnapshot(query(collection(db, "users", owner.uid, "lists", activeListId, "items"), orderBy("createdAt")), (snapshot) => {
        setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Item)));
      }),
      onSnapshot(collection(db, "users", owner.uid, "lists", activeListId, "heldItems"), (snapshot) => {
        setHeldItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HeldItem)));
      }),
      onSnapshot(collection(db, "users", owner.uid, "lists", activeListId, "suggestions"), (snapshot) => {
        setSuggestions(snapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data() as SuggestionsMap[string];
          return acc;
        }, {} as SuggestionsMap));
      }),
    ];

    return () => listeners.forEach(unsubscribe => unsubscribe());
  }, [user, activeListId, lists]);
  
  // Backup state on change
  useEffect(() => {
    if (!user || !activeListId) return;
    const backupState = debounce(async () => {
      const backupRef = doc(collection(db, "users", user.uid, "lists", activeListId, "backups"));
      await setDoc(backupRef, {
        createdAt: serverTimestamp(),
        categories,
        items,
        heldItems,
        suggestions,
      });
    }, 2000);

    if (categories.length > 0) {
      backupState();
    }

    return () => {
      backupState.cancel();
    };
  }, [categories, items, heldItems, suggestions, user, activeListId]);

  // Initialize view from URL on mount
  useEffect(() => {
    const initializeFromUrl = () => {
      const hash = window.location.hash.slice(1) // Remove the # character
      if (!hash) return

      const [view, categoryId] = hash.split('/')
      
      if (view === 'category' && categoryId) {
        // Check if category exists
        const categoryExists = categories.some((c: Category) => c.id === categoryId)
        if (categoryExists) {
          setCurrentView('single-category')
          setSelectedCategoryId(categoryId)
        }
      } else if (view === 'all-items' || view === 'suggestions' || view === 'held-items' || view === 'categories') {
        setCurrentView(view as ViewType)
        setSelectedCategoryId(null)
      }
    }

    initializeFromUrl()
  }, [categories])

  // Update URL whenever view or category changes
  useEffect(() => {
    let hash = ''
    
    if (currentView === 'single-category' && selectedCategoryId) {
      hash = `#category/${selectedCategoryId}`
    } else if (currentView !== 'categories') {
      hash = `#${currentView}`
    }
    
    // Only update if different to avoid infinite loops
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash || window.location.pathname)
    }
  }, [currentView, selectedCategoryId])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1)
      
      if (!hash) {
        setCurrentView('categories')
        setSelectedCategoryId(null)
        return
      }

      const [view, categoryId] = hash.split('/')
      
      if (view === 'category' && categoryId) {
        const categoryExists = categories.some((c: Category) => c.id === categoryId)
        if (categoryExists) {
          setCurrentView('single-category')
          setSelectedCategoryId(categoryId)
        } else {
          // Category doesn't exist, go to categories view
          setCurrentView('categories')
          setSelectedCategoryId(null)
        }
      } else if (view === 'all-items' || view === 'suggestions' || view === 'held-items' || view === 'categories') {
        setCurrentView(view as ViewType)
        setSelectedCategoryId(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [categories])

  const switchList = async (listId: string) => {
    if (!user) return;
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const owner = list.members.find(m => m.role === 'owner');
    if (!owner) return;
    
    setActiveListId(listId);
    await updateDoc(doc(db, "users", owner.uid, "lists", listId), {
      lastOpened: Date.now(),
    });
  };

  const createList = async (name: string) => {
    if (!user || !user.email) return;
    const newListRef = doc(collection(db, "users", user.uid, "lists"));
    const newList: List = {
      id: newListRef.id,
      name,
      createdAt: Date.now(),
      lastOpened: Date.now(),
      members: [{ uid: user.uid, email: user.email as string, role: 'owner' }],
      memberUids: [user.uid],
    };
    await setDoc(newListRef, newList);
    switchList(newList.id);
  };
  
  const getListOwner = () => {
    if (!activeListId) return null;
    const activeList = lists.find(l => l.id === activeListId);
    if (!activeList) return null;
    const owner = activeList.members.find(m => m.role === 'owner');
    return owner ? owner.uid : null;
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setCategories((categories) => {
        const oldIndex = categories.findIndex(c => c.id === active.id);
        const newIndex = categories.findIndex(c => c.id === over.id);
        
        const newCategories = arrayMove(categories, oldIndex, newIndex);

        const ownerUid = getListOwner();
        if (user && activeListId && ownerUid) {
          const batch = writeBatch(db);
          newCategories.forEach((category, index) => {
            const categoryRef = doc(db, "users", ownerUid, "lists", activeListId, "categories", category.id);
            batch.update(categoryRef, { order: index });
          });
          batch.commit();
        }

        return newCategories;
      });
    }
  };

  const acceptInvitation = async (invite: ListInvite) => {
    if (!user) return;
    try {
      await acceptInvitationService(invite, user);
      setInvitations(invitations.filter((i) => i.id !== invite.id));
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('There was an error accepting the invitation. Please try again.');
    }
  };

  const declineInvitation = async (invite: ListInvite) => {
    try {
      await declineInvitationService(invite);
      setInvitations(invitations.filter((i) => i.id !== invite.id));
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert('There was an error declining the invitation. Please try again.');
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) return;
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const owner = list.members.find(m => m.role === 'owner');
    if (!owner || owner.uid !== user.uid) {
      alert("You are not the owner of this list, so you cannot delete it.");
      return;
    }

    if (lists.length <= 1) {
      alert("You cannot delete your only list.");
      return;
    }
    if (!confirm(`Are you sure you want to delete this list and all of its contents? This cannot be undone.`)) return;

    try {
      // First, delete all subcollections
      const collectionsToMigrate = ["categories", "items", "suggestions", "heldItems", "backups"];
      for (const coll of collectionsToMigrate) {
        const snapshot = await getDocs(collection(db, "users", owner.uid, "lists", listId, coll));
        const deleteBatch = writeBatch(db);
        snapshot.forEach(doc => {
          deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
      }

      // Then, delete the list document itself
      await deleteDoc(doc(db, "users", owner.uid, "lists", listId));

      // Switch to another list
      if (activeListId === listId) {
        const newActiveList = lists.find(l => l.id !== listId);
        if (newActiveList) {
          setActiveListId(newActiveList.id);
        }
      }
    } catch (error) {
      console.error("Error deleting list: ", error);
      alert("Failed to delete list. Check console for details.");
    }
  };

  const migrateData = async () => {
    if (!user) return;

    let targetListId = activeListId;
    if (!targetListId) {
      const defaultList = lists.find(l => l.name === "My First List") || lists[0];
      if (defaultList) {
        targetListId = defaultList.id;
      } else {
        const newListRef = doc(collection(db, "users", user.uid, "lists"));
        const newList = { id: newListRef.id, name: "Migrated List", createdAt: Date.now(), lastOpened: Date.now() };
        await setDoc(newListRef, newList);
        targetListId = newList.id;
        setActiveListId(targetListId);
      }
    }
    
    if (!confirm(`This will migrate your old data to the list: "${lists.find(l => l.id === targetListId)?.name}". This may overwrite existing data in that list. Are you sure?`)) return;

    const batch = writeBatch(db);
    const collectionsToMigrate = ["categories", "items", "suggestions", "heldItems", "backups"];

    try {
      for (const coll of collectionsToMigrate) {
        const rootSnapshot = await getDocs(query(collection(db, coll)));
        rootSnapshot.forEach(docSnapshot => {
          const userDocRef = doc(db, "users", user.uid, "lists", targetListId!, coll, docSnapshot.id);
          batch.set(userDocRef, docSnapshot.data());
        });
      }

      await batch.commit();
      alert("Data migration successful!");

      if (confirm("Would you like to delete the old, unauthenticated data now? This cannot be undone.")) {
        const deleteBatch = writeBatch(db);
        for (const coll of collectionsToMigrate) {
          const rootSnapshot = await getDocs(query(collection(db, coll)));
          rootSnapshot.forEach(documentSnapshot => {
            deleteBatch.delete(documentSnapshot.ref);
          });
        }
        await deleteBatch.commit();
        alert("Old data deleted.");
        setHasRootData(false);
      }
    } catch (error) {
      console.error("Data migration error: ", error);
      alert("Data migration failed. Check the console for details.");
    }
  };

  const addItem = async (categoryId: string, text: string, quantity?: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const { text: newText, quantity: newQuantity } = parseItemText(text);
    if (!newText.trim()) return

    const capitalizedText = newText.trim().charAt(0).toUpperCase() + newText.trim().slice(1);
    const itemText = addEmojiToItem(capitalizedText)
    const newItemRef = doc(collection(db, "users", ownerUid, "lists", activeListId, "items"));
    const resolvedQuantity = quantity ?? newQuantity
    const newItem = {
      text: itemText,
      categoryId,
      done: false,
      createdAt: Date.now(),
      ...(resolvedQuantity && { quantity: resolvedQuantity }),
    };
    await setDoc(newItemRef, newItem);
    
    // Update suggestions
    const textForMatching = text.trim()
    const normalizedText = textForMatching.toLowerCase()
    const suggestionRef = doc(db, "users", ownerUid, "lists", activeListId, "suggestions", normalizedText);
    const suggestionDoc = await getDoc(suggestionRef);
    if (suggestionDoc.exists()) {
      await setDoc(suggestionRef, {
        frequency: suggestionDoc.data().frequency + 1,
        lastAdded: Date.now(),
      }, { merge: true });
    } else {
      await setDoc(suggestionRef, {
        text: itemText,
        frequency: 1,
        lastAdded: Date.now(),
        categoryId: categoryId,
      });
    }
  }

  const removeItem = async (itemId: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);
    await deleteDoc(itemRef);
  }

  const toggleItemDone = async (itemId: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const originalItems = items;
    const itemToToggle = items.find(item => item.id === itemId);
    if (!itemToToggle) return;

    // Optimistic UI update
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    );

    // Firestore update
    try {
      const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);
      await setDoc(itemRef, { done: !itemToToggle.done }, { merge: true });
    } catch (error) {
      console.error("Error updating item: ", error);
      // Revert the optimistic update on error
      setItems(originalItems);
    }
  }

  const addCategory = async (name: string, color: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const newCategoryRef = doc(collection(db, "users", ownerUid, "lists", activeListId, "categories"));
    await setDoc(newCategoryRef, { name, color, order: categories.length });
  }

  const updateCategory = async (id: string, name: string, color: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const categoryRef = doc(db, "users", ownerUid, "lists", activeListId, "categories", id);
    await setDoc(categoryRef, { name, color }, { merge: true });
  }

  const deleteCategory = async (id: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const batch = writeBatch(db);
    const categoryRef = doc(db, "users", ownerUid, "lists", activeListId, "categories", id);
    batch.delete(categoryRef);

    const categoryItems = items.filter(item => item.categoryId === id);
    categoryItems.forEach(item => {
      const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", item.id);
      batch.delete(itemRef);
    });

    await batch.commit();

    if (selectedCategoryId === id) {
      setCurrentView('categories');
      setSelectedCategoryId(null);
    }
  }

  const editItem = async (itemId: string, newText: string, quantity?: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const capitalizedText = newText.trim().charAt(0).toUpperCase() + newText.trim().slice(1);
    const { text: trimmedText } = parseItemText(capitalizedText);
    const itemText = addEmojiToItem(trimmedText)
    const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);
    
    const oldItemDoc = await getDoc(itemRef);
    const oldItem = oldItemDoc.data();

    const updatedItem = {
      text: itemText,
      quantity: quantity === undefined ? null : quantity,
    };
    await setDoc(itemRef, updatedItem, { merge: true });

    if (oldItem && oldItem.text !== itemText) {
      const oldTextWithoutEmoji = oldItem.text.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').toLowerCase()
      const newTextWithoutEmoji = newText.trim().toLowerCase()
      
      if (oldTextWithoutEmoji !== newTextWithoutEmoji) {
        const oldSuggestionRef = doc(db, "users", ownerUid, "lists", activeListId, "suggestions", oldTextWithoutEmoji);
        const oldSuggestionDoc = await getDoc(oldSuggestionRef);
        if (oldSuggestionDoc.exists()) {
          const newSuggestionRef = doc(db, "users", ownerUid, "lists", activeListId, "suggestions", newTextWithoutEmoji);
          await setDoc(newSuggestionRef, oldSuggestionDoc.data());
          await deleteDoc(oldSuggestionRef);
        }
      }
    }
  }

  const changeItemCategory = async (itemId: string, toCategoryId: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);
    await setDoc(itemRef, { categoryId: toCategoryId }, { merge: true });
  }

  const removeDoneItems = async () => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    if (!confirm('Remove all completed items from your shopping list?')) return

    const batch = writeBatch(db);
    items.forEach(item => {
      if (item.done) {
        const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", item.id);
        batch.delete(itemRef);
      }
    });
    await batch.commit();
  }

  const removeAllItems = async () => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    if (!confirm('Remove ALL items from your shopping list? Held items will be moved back to their categories.')) return

    const batch = writeBatch(db);
    items.forEach(item => {
      const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", item.id);
      batch.delete(itemRef);
    });
    heldItems.forEach(item => {
      const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "heldItems", item.id);
      batch.delete(itemRef);
    });
    await batch.commit();
  }

  const holdItem = async (itemId: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const batch = writeBatch(db);
    const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);
    const heldItemRef = doc(db, "users", ownerUid, "lists", activeListId, "heldItems", itemId);

    batch.delete(itemRef);
    batch.set(heldItemRef, { ...item });
    
    await batch.commit();
  }

  const unholdItem = async (itemId: string, categoryId: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const heldItem = heldItems.find(i => i.id === itemId)
    if (!heldItem) return

    const batch = writeBatch(db);
    const heldItemRef = doc(db, "users", ownerUid, "lists", activeListId, "heldItems", itemId);
    const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);

    batch.delete(heldItemRef);
    batch.set(itemRef, { text: heldItem.text, categoryId, done: false, createdAt: heldItem.createdAt || Date.now() });

    await batch.commit();
  }

  const deleteHeldItem = async (itemId: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const heldItemRef = doc(db, "users", ownerUid, "lists", activeListId, "heldItems", itemId);
    await deleteDoc(heldItemRef);
  }

  const editHeldItem = async (itemId: string, newText: string, newQuantity?: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const { text } = parseItemText(newText);
    const capitalizedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1);
    const itemText = addEmojiToItem(capitalizedText)
    const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "heldItems", itemId);
    
    const updatedItem = {
      text: itemText,
      quantity: newQuantity === undefined ? null : newQuantity,
    };
    await setDoc(itemRef, updatedItem, { merge: true });
  }

  const editSuggestion = async (oldKey: string, newText: string, categoryId: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const newKey = newText.toLowerCase()
    const suggestionRef = doc(db, "users", ownerUid, "lists", activeListId, "suggestions", oldKey);
    const suggestionDoc = await getDoc(suggestionRef);
    
    if (!suggestionDoc.exists()) return

    if (oldKey !== newKey) {
      const batch = writeBatch(db);
      const newSuggestionRef = doc(db, "users", ownerUid, "lists", activeListId, "suggestions", newKey);
      batch.set(newSuggestionRef, { ...suggestionDoc.data(), text: addEmojiToItem(newText), categoryId });
      batch.delete(suggestionRef);
      await batch.commit();
    } else {
      await setDoc(suggestionRef, { text: addEmojiToItem(newText), categoryId }, { merge: true });
    }
  }

  const deleteSuggestion = async (key: string) => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    const suggestionRef = doc(db, "users", ownerUid, "lists", activeListId, "suggestions", key);
    await deleteDoc(suggestionRef);
  }
  
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    setSelectedCategoryId(null)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCurrentView('single-category')
  }

  const setupSampleData = async () => {
    const ownerUid = getListOwner();
    if (!user || !activeListId || !ownerUid) return;
    if (!confirm('This will replace your current list with sample data. Are you sure?')) return

    const batch = writeBatch(db);

    const collectionsToDelete = ["categories", "items", "heldItems", "suggestions"];
    for (const coll of collectionsToDelete) {
      const snapshot = await getDocs(collection(db, "users", ownerUid, "lists", activeListId, coll));
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
    }

    // Add sample data
    const { SAMPLE_CATEGORIES, SAMPLE_ITEMS } = await import('./sample-data');
    SAMPLE_CATEGORIES.forEach(category => {
      const categoryRef = doc(db, "users", ownerUid, "lists", activeListId, "categories", category.id);
      batch.set(categoryRef, category);
    });
    Object.entries(SAMPLE_ITEMS).forEach(([categoryId, items]) => {
      items.forEach((item, index) => {
        const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", item.id);
        batch.set(itemRef, { ...item, categoryId, createdAt: Date.now() + index });
      });
    });

    await batch.commit();

    setCurrentView('categories');
    setSelectedCategoryId(null);
  }
  
  const handleInlineAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryColor)
      setNewCategoryName('')
      setNewCategoryColor(PRESET_COLORS[0])
      setShowInlineAddCategoryForm(false)
    }
  }

  const handleLogout = () => {
    auth.signOut();
  }

  // Get the selected category object
  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null
  const activeList = lists.find(l => l.id === activeListId);

  if (isLoading) {
    return <div className="main-loading">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 {activeList?.name || 'Shopping List'}</h1>
        <HeaderMenu 
          user={user}
          onLogout={handleLogout}
          onRemoveDone={removeDoneItems} 
          onRemoveAll={removeAllItems}
          onSetupSampleData={setupSampleData} 
          hasRootData={hasRootData}
          onMigrateData={migrateData}
          lists={lists}
          activeListId={activeListId}
          onSelectList={switchList}
          onCreateList={createList}
          onDeleteList={deleteList}
        />
      </header>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="app-main">
          {/* Desktop Sidebar */}
          <aside className="sidebar">
            <SortableContext 
              items={categories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <nav className="sidebar-nav">
                {categories.map((category) => (
                  <SortableCategoryItem 
                    key={category.id} 
                    id={category.id} 
                    category={category} 
                    items={items}
                    currentView={currentView}
                    selectedCategoryId={selectedCategoryId}
                    handleCategoryClick={handleCategoryClick}
                  />
                ))}
                
                {/* Inline Add Category form */}
                {showInlineAddCategoryForm ? (
                  <form className="sidebar-add-category-form" onSubmit={handleInlineAddCategory}>
                    <input
                      type="text"
                      placeholder="New category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      autoFocus
                      className="sidebar-category-input"
                    />
                    <div className="sidebar-color-picker">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`sidebar-color-option ${newCategoryColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewCategoryColor(color)}
                        />
                      ))}
                    </div>
                    <div className="sidebar-add-category-actions">
                      <button type="submit" className="sidebar-save-btn">✓ Add</button>
                      <button type="button" className="sidebar-cancel-btn" onClick={() => setShowInlineAddCategoryForm(false)}>✕ Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="sidebar-item add-category-toggle"
                    onClick={() => setShowInlineAddCategoryForm(true)}
                  >
                    <span className="sidebar-item-name">➕ Add New Category</span>
                  </button>
                )}
              </nav>
            </SortableContext>
          </aside>

          <div style={{ flex: 1 }}>
            <div style={{ display: currentView === 'categories' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <CategoriesView
                categories={categories}
                items={items}
                onCategoryClick={handleCategoryClick}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
                presetColors={PRESET_COLORS}
              />
            </div>
            <div style={{ display: currentView === 'all-items' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <AllItemsView
                categories={categories}
                items={items}
                onRemoveItem={removeItem}
                onToggleItem={toggleItemDone}
                onEditItem={editItem}
                onChangeCategory={changeItemCategory}
                onHoldItem={holdItem}
              />
            </div>
            <div style={{ display: currentView === 'suggestions' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <SuggestionsView
                suggestions={suggestions}
                categories={categories}
                items={items}
                onAddSuggestion={addItem}
                onEditSuggestion={editSuggestion}
                onDeleteSuggestion={deleteSuggestion}
              />
            </div>
            <div style={{ display: currentView === 'held-items' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <HeldItemsView
                heldItems={heldItems}
                categories={categories}
                onUnhold={unholdItem}
                onDelete={deleteHeldItem}
                onEditItem={editHeldItem}
              />
            </div>
            <div style={{ display: currentView === 'single-category' ? 'block' : 'none', gridArea: '1 / 1' }}>
              {selectedCategory && (
                <SingleCategoryView
                  category={selectedCategory}
                  categories={categories}
                  items={items.filter(item => item.categoryId === selectedCategoryId)}
                  suggestions={suggestions}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onToggleItem={toggleItemDone}
                  onEditItem={editItem}
                  onChangeCategory={changeItemCategory}
                  onHoldItem={holdItem}
                  onBack={() => handleViewChange('categories')}
                />
              )}
            </div>
            <div style={{ display: currentView === 'history' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <HistoryView />
            </div>
            <div style={{ display: currentView === 'invitations' ? 'block' : 'none', gridArea: '1 / 1' }}>
              <InvitationsView
                invitations={invitations}
                onAccept={acceptInvitation}
                onDecline={declineInvitation}
              />
            </div>
          </div>
        </div>
      </DndContext>

      {/* Bottom Navigation */}
      <BottomNav activeView={currentView} onViewChange={handleViewChange} />
    </div>
  )
}

export default App