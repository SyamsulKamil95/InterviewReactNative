import React, { useMemo } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useAppStore } from '@/store';
import type { Transaction } from '@/types';

export default function TransactionsScreen() {
  const { transactions } = useAppStore();

  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a, b) => b.timestamp - a.timestamp),
    [transactions]
  );

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.transactionIcon,
        item.type === 'sent' 
          ? styles.transactionIconSent 
          : styles.transactionIconReceived
      ]}>
        {item.type === 'sent' ? (
          <ArrowUpRight size={24} color="#EF4444" />
        ) : (
          <ArrowDownLeft size={24} color="#10B981" />
        )}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionName}>
          {item.recipientName}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(item.timestamp)}
        </Text>
        {item.note && (
          <Text style={styles.transactionNote} numberOfLines={1}>
            {item.note}
          </Text>
        )}
        <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        item.type === 'sent' 
          ? styles.amountSent 
          : styles.amountReceived
      ]}>
        {item.type === 'sent' ? '-' : '+'}
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {sortedTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyStateText}>
            Your transaction history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionIconSent: {
    backgroundColor: '#FEE2E2',
  },
  transactionIconReceived: {
    backgroundColor: '#D1FAE5',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E293B',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic' as const,
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statuscompleted: {
    backgroundColor: '#DCFCE7',
  },
  statuspending: {
    backgroundColor: '#FEF3C7',
  },
  statusfailed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#059669',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 12,
  },
  amountSent: {
    color: '#EF4444',
  },
  amountReceived: {
    color: '#10B981',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
