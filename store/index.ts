import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Account, Recipient, Transaction } from '@/types';

interface AppState {
  account: Account;
  recipients: Recipient[];
  transactions: Transaction[];
  recentRecipients: Recipient[];
  addRecipient: (recipient: Recipient) => void;
  addTransaction: (transaction: Transaction) => void;
  updateBalance: (newBalance: number) => void;
  getRecipientById: (id: string) => Recipient | undefined;
}

const MOCK_RECIPIENTS: Recipient[] = [
  {
    id: '1',
    name: 'Syamsul Kamil',
    accountNumber: '****4529',
    bankName: 'CIMB Bank',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Albert Chin',
    accountNumber: '****7836',
    bankName: 'Hong Leong Bank',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '3',
    name: 'Sivarasa',
    accountNumber: '****2109',
    bankName: 'RHB Bank',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    recipientId: '1',
    recipientName: 'Syamsul Kamil',
    amount: 125.50,
    note: 'Dinner last night',
    timestamp: Date.now() - 3600000 * 2,
    status: 'completed',
    type: 'sent',
  },
  {
    id: '2',
    recipientId: '2',
    recipientName: 'Albert Chin',
    amount: 500.00,
    timestamp: Date.now() - 86400000,
    status: 'completed',
    type: 'sent',
  },
  {
    id: '3',
    recipientId: '3',
    recipientName: 'Sivarasa',
    amount: 75.25,
    note: 'Concert tickets',
    timestamp: Date.now() - 86400000 * 2,
    status: 'completed',
    type: 'received',
  },
];

export const useAppStore = create<AppState>()(devtools((set, get) => ({
  account: {
    balance: 4105.80,
    accountNumber: '****8901',
    accountHolder: 'David Beckham',
  },
  recipients: MOCK_RECIPIENTS,
  transactions: MOCK_TRANSACTIONS,
  recentRecipients: MOCK_RECIPIENTS.slice(0, 3),
  
  addRecipient: (recipient) => set((state) => ({
    recipients: [...state.recipients, recipient],
  })),
  
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions],
  })),
  
  updateBalance: (newBalance) => set((state) => ({
    account: { ...state.account, balance: newBalance },
  })),
  
  getRecipientById: (id) => {
    return get().recipients.find((r) => r.id === id);
  },
}), { name: 'AppStore' }));
