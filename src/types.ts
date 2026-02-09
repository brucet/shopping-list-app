export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Item {
  id: string;
  createdAt: number;
  text: string;
  done?: boolean;
  categoryId: string;
  quantity?: string;
}

export interface Suggestion {
  text: string;
  frequency: number;
  lastAdded: number;
  categoryId: string;
}

export interface SuggestionsMap {
  [normalizedText: string]: Suggestion;
}

export interface HeldItem {
  id: string;
  text: string;
  categoryId: string;
  quantity?: string;
  createdAt: number;
}

export type ViewType = 'categories' | 'all-items' | 'suggestions' | 'held-items' | 'single-category' | 'history' | 'invitations';



export type Role = 'owner' | 'editor' | 'viewer';



export interface ListMember {

  uid: string;

  email: string;

  role: Role;

}



// Exported List interface

export interface List {

  id:string;

  name: string;

  createdAt: number;

  lastOpened: number;

  members: {
    [uid: string]: ListMember;
  };

  memberUids: string[];

}



export interface ListInvite {

  id: string;

  listId: string;

  listName: string;

  fromUid: string;

  fromEmail: string;

  toEmail: string;

}
