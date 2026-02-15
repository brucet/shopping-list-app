import React from 'react';
import {ListInvite} from '../types';
import '../styles/InvitationsView.css';

interface InvitationsViewProps {
    invitations: ListInvite[];
    onAccept: (invite: ListInvite) => void;
    onDecline: (invite: ListInvite) => void;
}

const InvitationsView: React.FC<InvitationsViewProps> = ({invitations, onAccept, onDecline}) => {
    return (
        <div className="invitations-view">
            <h2>Pending Invitations</h2>
            {invitations.length === 0 ? (
                <p>You have no pending invitations.</p>
            ) : (
                <ul className="invitations-list">
                    {invitations.map((invite) => (
                        <li key={invite.id} className="invitation-item">
                            <div className="invitation-details">
                                <p>
                                    <strong>{invite.fromEmail}</strong> has invited you to join the list{' '}
                                    <strong>"{invite.listName}"</strong>.
                                </p>
                            </div>
                            <div className="invitation-actions">
                                <button onClick={() => onAccept(invite)}>Accept</button>
                                <button onClick={() => onDecline(invite)}>Decline</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InvitationsView;
