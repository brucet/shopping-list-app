import {useEffect, useState} from 'react';
import {
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import {db} from '../firebase';
import {User} from 'firebase/auth';
import type {Category, HeldItem, Item, List, ListInvite, SuggestionsMap} from '../types';
import {
    acceptInvitation as acceptInvitationService,
    declineInvitation as declineInvitationService,
    getInvitations
} from '../services/list-sharing';
import debounce from 'lodash.debounce';
import {parseItemText} from '../utils/itemParser';
import {addEmojiToItem} from '../utils/emojiMatcher';
import {arrayMove} from '@dnd-kit/sortable';

export const useFirestore = (user: User | null) => {
    const [lists, setLists] = useState<List[]>([]);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false);
    const [items, setItems] = useState<Item[]>([]);
    const [heldItems, setHeldItems] = useState<HeldItem[]>([]);
    const [suggestions, setSuggestions] = useState<SuggestionsMap>({});
    const [invitations, setInvitations] = useState<ListInvite[]>([]);
    const [hasRootData, setHasRootData] = useState(false);

    useEffect(() => {
        if (!user) return;
        getInvitations(user).then(setInvitations);
    }, [user]);

    // Fetch lists
    useEffect(() => {
        if (!user || !user.email) return;

        const q = query(collectionGroup(db, 'lists'), where('memberUids', 'array-contains', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userLists = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as List));

            if (userLists.length === 0 && !activeListId) {
                const newListRef = doc(collection(db, "users", user.uid, "lists"));
                const newList: List = {
                    id: newListRef.id,
                    name: "My First List",
                    createdAt: Date.now(),
                    lastOpened: Date.now(),
                    members: {
                        [user.uid]: {uid: user.uid, email: user.email as string, role: 'owner'},
                    },
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

        const ownerUid = Object.keys(activeList.members).find(uid => activeList.members[uid].role === 'owner');
        if (!ownerUid) return;

        const listeners = [
            onSnapshot(query(collection(db, "users", ownerUid, "lists", activeListId, "categories"), orderBy("order")), (snapshot) => {
                setCategories(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()} as Category)));
                setCategoriesLoaded(true);
            }),
            onSnapshot(query(collection(db, "users", ownerUid, "lists", activeListId, "items"), orderBy("createdAt")), (snapshot) => {
                setItems(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()} as Item)));
            }),
            onSnapshot(collection(db, "users", ownerUid, "lists", activeListId, "heldItems"), (snapshot) => {
                setHeldItems(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()} as HeldItem)));
            }),
            onSnapshot(collection(db, "users", ownerUid, "lists", activeListId, "suggestions"), (snapshot) => {
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
            const limitedItems = items.slice(-250); // Keep the last 250 items
            await setDoc(backupRef, {
                createdAt: serverTimestamp(),
                categories,
                items: limitedItems,
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

    const getListOwner = () => {
        if (!activeListId) return null;
        const activeList = lists.find(l => l.id === activeListId);
        if (!activeList) return null;
        const ownerEntry = Object.entries(activeList.members).find(([, member]) => member.role === 'owner');
        return ownerEntry ? ownerEntry[0] : null;
    }

    const handleCategoryOrderChange = (oldIndex: number, newIndex: number) => {
        const ownerUid = getListOwner();
        if (!user || !activeListId || !ownerUid) return;

        const newCategories = arrayMove(categories, oldIndex, newIndex);
        setCategories(newCategories);

        const batch = writeBatch(db);
        newCategories.forEach((category, index) => {
            const categoryRef = doc(db, "users", ownerUid, "lists", activeListId, "categories", category.id);
            batch.update(categoryRef, {order: index});
        });
        batch.commit();
    };

    const switchList = async (listId: string) => {
        if (!user) return;
        const list = lists.find(l => l.id === listId);
        if (!list) return;

        const ownerUid = Object.keys(list.members).find(uid => list.members[uid].role === 'owner');
        if (!ownerUid) return;

        setActiveListId(listId);
        await updateDoc(doc(db, "users", ownerUid, "lists", listId), {
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
            members: {
                [user.uid]: {uid: user.uid, email: user.email as string, role: 'owner'},
            },
            memberUids: [user.uid],
        };
        await setDoc(newListRef, newList);
        switchList(newList.id);
    };

    const updateList = async (listId: string, newName: string) => {
        if (!user) return;
        const list = lists.find(l => l.id === listId);
        if (!list) return;

        const ownerUid = Object.keys(list.members).find(uid => list.members[uid].role === 'owner');
        if (!ownerUid) return;

        await updateDoc(doc(db, "users", ownerUid, "lists", listId), {
            name: newName,
        });
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

        const ownerUid = Object.keys(list.members).find(uid => list.members[uid].role === 'owner');
        if (!ownerUid || ownerUid !== user.uid) {
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
                const snapshot = await getDocs(collection(db, "users", ownerUid, "lists", listId, coll));
                const deleteBatch = writeBatch(db);
                snapshot.forEach(doc => {
                    deleteBatch.delete(doc.ref);
                });
                await deleteBatch.commit();
            }

            // Then, delete the list document itself
            await deleteDoc(doc(db, "users", ownerUid, "lists", listId));

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
        if (!user || !user.email) return;

        if (!confirm(`This will create a new list called "Migrated List" and move your old data to it. This may overwrite existing data in that list. Are you sure?`)) return;

        const newListRef = doc(collection(db, "users", user.uid, "lists"));
        const newList: List = {
            id: newListRef.id,
            name: "Migrated List",
            createdAt: Date.now(),
            lastOpened: Date.now(),
            members: {
                [user.uid]: {uid: user.uid, email: user.email as string, role: 'owner'},
            },
            memberUids: [user.uid],
        };
        await setDoc(newListRef, newList);
        const targetListId = newList.id;

        const batch = writeBatch(db);
        const collectionsToMigrate = ["categories", "items", "suggestions", "heldItems"];

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
            setActiveListId(targetListId);

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
        const {text: newText, quantity: newQuantity} = parseItemText(text);
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
            ...(resolvedQuantity && {quantity: resolvedQuantity}),
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
            }, {merge: true});
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
                item.id === itemId ? {...item, done: !item.done} : item
            )
        );

        // Firestore update
        try {
            const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);
            await setDoc(itemRef, {done: !itemToToggle.done}, {merge: true});
        } catch (error) {
            console.error("Error updating item: ", error);
            // Revert the optimistic update on error
            setItems(originalItems);
        }
    }

    const addCategory = async (name: string) => {
        const ownerUid = getListOwner();
        if (!user || !activeListId || !ownerUid) return;
        const newCategoryRef = doc(collection(db, "users", ownerUid, "lists", activeListId, "categories"));
        await setDoc(newCategoryRef, {name, order: categories.length});
    }

    const updateCategory = async (id: string, name: string) => {
        const ownerUid = getListOwner();
        if (!user || !activeListId || !ownerUid) return;
        const categoryRef = doc(db, "users", ownerUid, "lists", activeListId, "categories", id);
        await setDoc(categoryRef, {name}, {merge: true});
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
    }

    const editItem = async (itemId: string, newText: string, quantity?: string) => {
        const ownerUid = getListOwner();
        if (!user || !activeListId || !ownerUid) return;
        const capitalizedText = newText.trim().charAt(0).toUpperCase() + newText.trim().slice(1);
        const {text: trimmedText} = parseItemText(capitalizedText);
        const itemText = addEmojiToItem(trimmedText)
        const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", itemId);

        const oldItemDoc = await getDoc(itemRef);
        const oldItem = oldItemDoc.data();

        const updatedItem = {
            text: itemText,
            quantity: quantity === undefined ? null : quantity,
        };
        await setDoc(itemRef, updatedItem, {merge: true});

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
        await setDoc(itemRef, {categoryId: toCategoryId}, {merge: true});
    }

    const removeDoneItems = async () => {
        const ownerUid = getListOwner();
        if (!user || !activeListId || !ownerUid) return;

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

        // Delete all regular items
        items.forEach(item => {
            const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", item.id);
            batch.delete(itemRef);
        });

        // Move held items back to regular items and delete from heldItems
        heldItems.forEach(heldItem => {
            const targetCategoryId =
                !heldItem.categoryId || !categories.some(c => c.id === heldItem.categoryId)
                    ? categories.length > 0
                        ? categories[0].id
                        : 'default-category-id'
                    : heldItem.categoryId;

            // Fallback if original category doesn't exist or is not set
            if (!heldItem.categoryId || !categories.some(c => c.id === heldItem.categoryId)) {
                // Note: For a real app, 'default-category-id' would need to be a valid existing category or handled by creation
                console.warn(`Held item "${heldItem.text}" original category not found or not set. Assigning to: ${targetCategoryId}`);
            }

            const newItemRef = doc(collection(db, "users", ownerUid, "lists", activeListId, "items"));
            batch.set(newItemRef, {
                text: heldItem.text,
                categoryId: targetCategoryId,
                done: false, // Held items become undone when moved back
                createdAt: heldItem.createdAt || Date.now(),
                quantity: heldItem.quantity || null,
            });

            const heldItemRef = doc(db, "users", ownerUid, "lists", activeListId, "heldItems", heldItem.id);
            batch.delete(heldItemRef);
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
        batch.set(heldItemRef, {...item});

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
        batch.set(itemRef, {text: heldItem.text, categoryId, done: false, createdAt: heldItem.createdAt || Date.now()});

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
        const {text} = parseItemText(newText);
        const capitalizedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1);
        const itemText = addEmojiToItem(capitalizedText)
        const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "heldItems", itemId);

        const updatedItem = {
            text: itemText,
            quantity: newQuantity === undefined ? null : newQuantity,
        };
        await setDoc(itemRef, updatedItem, {merge: true});
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
            batch.set(newSuggestionRef, {...suggestionDoc.data(), text: addEmojiToItem(newText), categoryId});
            batch.delete(suggestionRef);
            await batch.commit();
        } else {
            await setDoc(suggestionRef, {text: addEmojiToItem(newText), categoryId}, {merge: true});
        }
    }

    const deleteSuggestion = async (key: string) => {
        const ownerUid = getListOwner();
        if (!user || !activeListId || !ownerUid) return;
        const suggestionRef = doc(db, "users", ownerUid, "lists", activeListId, "suggestions", key);
        await deleteDoc(suggestionRef);
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
        const {SAMPLE_CATEGORIES, SAMPLE_ITEMS} = await import('../sample-data');
        SAMPLE_CATEGORIES.forEach(category => {
            const categoryRef = doc(db, "users", ownerUid, "lists", activeListId, "categories", category.id);
            batch.set(categoryRef, category);
        });
        Object.entries(SAMPLE_ITEMS).forEach(([categoryId, items]) => {
            items.forEach((item, index) => {
                const itemRef = doc(db, "users", ownerUid, "lists", activeListId, "items", item.id);
                batch.set(itemRef, {...item, categoryId, createdAt: Date.now() + index});
            });
        });

        await batch.commit();
    }

    return {
        lists,
        activeListId,
        categories,
        categoriesLoaded,
        items,
        heldItems,
        suggestions,
        invitations,
        hasRootData,
        switchList,
        createList,
        updateList,
        acceptInvitation,
        declineInvitation,
        deleteList,
        migrateData,
        addItem,
        removeItem,
        toggleItemDone,
        addCategory,
        updateCategory,
        deleteCategory,
        editItem,
        changeItemCategory,
        removeDoneItems,
        removeAllItems,
        holdItem,
        unholdItem,
        deleteHeldItem,
        editHeldItem,
        editSuggestion,
        deleteSuggestion,
        setupSampleData,
        handleCategoryOrderChange,
    };
};