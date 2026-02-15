import {useState, useEffect} from 'react';
import {collection, onSnapshot, query, orderBy, getDoc, doc, writeBatch, getDocs} from 'firebase/firestore';
import {db} from '../firebase';
import type {Category, Item, SuggestionsMap, HeldItem} from '../types';
import '../styles/HistoryView.css';

interface Backup {
    id: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    categories: Category[];
    items: Item[];
    heldItems: HeldItem[];
    suggestions: SuggestionsMap;
}

export default function HistoryView() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, 'backups'), orderBy('createdAt', 'desc')), (snapshot) => {
            const backupData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Backup));
            setBackups(backupData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleRestore = async (backupId: string) => {
        if (!confirm('Are you sure you want to restore this backup? This will overwrite your current data.')) {
            return;
        }

        const backupRef = doc(db, 'backups', backupId);
        const backupDoc = await getDoc(backupRef);

        if (backupDoc.exists()) {
            const backupData = backupDoc.data() as Backup;
            const batch = writeBatch(db);

            // Clear existing data
            const categoriesSnapshot = await getDocs(collection(db, 'categories'));
            categoriesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            const itemsSnapshot = await getDocs(collection(db, 'items'));
            itemsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            const heldItemsSnapshot = await getDocs(collection(db, 'heldItems'));
            heldItemsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            const suggestionsSnapshot = await getDocs(collection(db, 'suggestions'));
            suggestionsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

            // Restore data from backup
            backupData.categories.forEach((category) => {
                const categoryRef = doc(db, 'categories', category.id);
                batch.set(categoryRef, category);
            });
            backupData.items.forEach((item) => {
                const itemRef = doc(db, 'items', item.id);
                batch.set(itemRef, item);
            });
            backupData.heldItems.forEach((item) => {
                const itemRef = doc(db, 'heldItems', item.id);
                batch.set(itemRef, item);
            });
            Object.entries(backupData.suggestions).forEach(([key, value]) => {
                const suggestionRef = doc(db, 'suggestions', key);
                batch.set(suggestionRef, value);
            });

            await batch.commit();
            alert('Backup restored successfully!');
        }
    };

    return (
        <div className="history-view">
            <div className="history-header">
                <h2>Backup History</h2>
            </div>
            {loading ? (
                <p>Loading history...</p>
            ) : (
                <div className="history-list">
                    {backups.map((backup) => (
                        <div key={backup.id} className="history-item">
                            <div className="history-item-info">
                                <p className="history-item-date">
                                    {backup.createdAt ? new Date(backup.createdAt.seconds * 1000).toLocaleString() : 'Date not available'}
                                </p>
                                <p className="history-item-summary">
                                    {backup.categories.length} categories, {backup.items.length} items
                                </p>
                            </div>
                            <button onClick={() => handleRestore(backup.id)} className="restore-btn">
                                Restore
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
