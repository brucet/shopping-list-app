import { collection, addDoc, query, where, getDocs, doc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { List, ListInvite, ListMember } from '../types';
import { User } from 'firebase/auth';

export const sendListInvite = async (
  list: List,
  fromUser: User,
  toEmail: string
): Promise<string> => {
  if (!fromUser.email) {
    throw new Error('User does not have an email address.');
  }

  const invite: Omit<ListInvite, 'id'> = {
    listId: list.id,
    listName: list.name,
    fromUid: fromUser.uid,
    fromEmail: fromUser.email,
    toEmail,
  };

  const docRef = await addDoc(collection(db, 'list-invites'), invite);
  return docRef.id;
};

export const getInvitations = async (user: User): Promise<ListInvite[]> => {
  if (!user.email) {
    return [];
  }
  const q = query(collection(db, 'list-invites'), where('toEmail', '==', user.email));
  const querySnapshot = await getDocs(q);
  const invitations: ListInvite[] = [];
  querySnapshot.forEach((doc) => {
    invitations.push({ id: doc.id, ...doc.data() } as ListInvite);
  });
  return invitations;
};

export const acceptInvitation = async (invite: ListInvite, user: User) => {
  if (!user.email) {
    throw new Error('User does not have an email address.');
  }
  const batch = writeBatch(db);

  const listRef = doc(db, 'users', invite.fromUid, 'lists', invite.listId);
  const listDoc = await getDoc(listRef);
  if (!listDoc.exists()) {
    throw new Error('List does not exist.');
  }
  const list = listDoc.data() as List;

  const newMember: ListMember = {
    uid: user.uid,
    email: user.email,
    role: 'editor',
  };
  batch.update(listRef, {
    members: { ...list.members, [user.uid]: newMember },
    memberUids: [...(list.memberUids || []), user.uid],
  });
  
  const inviteRef = doc(db, 'list-invites', invite.id);
  batch.delete(inviteRef);

  await batch.commit();
};

export const declineInvitation = async (invite: ListInvite) => {
  const inviteRef = doc(db, 'list-invites', invite.id);
  await deleteDoc(inviteRef);
};