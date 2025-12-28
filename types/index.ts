export interface Recipient {
  id: string;
  name: string;
  accountNumber: string;
  bankName?: string;
  avatar?: string;
  phoneNumber?: string;
}

export interface Transaction {
  id: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  note?: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'sent' | 'received';
}

export interface Account {
  balance: number;
  accountNumber: string;
  accountHolder: string;
}
