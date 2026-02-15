import React, {useState} from 'react';
import {List} from '../types';
import '../styles/ShareListModal.css';
import {User} from 'firebase/auth';
import {sendListInvite} from '../services/list-sharing';

interface ShareListModalProps {
    list: List;
    user: User;
    onClose: () => void;
}

const ShareListModal: React.FC<ShareListModalProps> = ({list, user, onClose}) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleShare = async () => {
        if (!email) return;
        setIsSending(true);
        try {
            await sendListInvite(list, user, email);
            setSent(true);
        } catch (error) {
            console.error('Error sending invite:', error);
            alert('There was an error sending the invitation. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="share-list-modal-overlay">
            <div className="share-list-modal">
                <h2>Share "{list.name}"</h2>
                {sent ? (
                    <div>
                        <p>Invitation sent to {email}!</p>
                        <button onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <>
                        <div className="share-form">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button onClick={handleShare} disabled={isSending}>
                                {isSending ? 'Sending...' : 'Share'}
                            </button>
                        </div>
                        <button className="close-button" onClick={onClose}>
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShareListModal;
