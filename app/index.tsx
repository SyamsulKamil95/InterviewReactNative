import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Send, 
  TrendingUp, 
  History, 
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import { useAppStore } from '@/store';

export default function HomeScreen() {
  const router = useRouter();
  const { account, transactions, recentRecipients } = useAppStore();
  const [balanceVisible, setBalanceVisible] = React.useState(true);

  const recentTransactions = useMemo(() => 
    transactions.slice(0, 5),
    [transactions]
  );

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{account.accountHolder}</Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <TouchableOpacity 
                onPress={() => setBalanceVisible(!balanceVisible)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {balanceVisible ? (
                  <Eye size={20} color="#94A3B8" />
                ) : (
                  <EyeOff size={20} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.balance}>
              {balanceVisible ? formatCurrency(account.balance) : '••••••'}
            </Text>
            <Text style={styles.accountNumber}>{account.accountNumber}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/transfer')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
              <Send size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/recipients')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <TrendingUp size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Recipients</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/transactions')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <History size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {recentRecipients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Recipients</Text>
              <TouchableOpacity onPress={() => router.push('/recipients')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipientsScroll}
            >
              {recentRecipients.map((recipient) => (
                <TouchableOpacity 
                  key={recipient.id}
                  style={styles.recipientCard}
                  onPress={() => router.push({
                    pathname: '/transfer',
                    params: { recipientId: recipient.id }
                  })}
                >
                  <View style={styles.recipientAvatar}>
                    <Text style={styles.recipientInitial}>
                      {recipient.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.recipientName} numberOfLines={1}>
                    {recipient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon,
                transaction.type === 'sent' 
                  ? styles.transactionIconSent 
                  : styles.transactionIconReceived
              ]}>
                {transaction.type === 'sent' ? (
                  <ArrowUpRight size={20} color="#EF4444" />
                ) : (
                  <ArrowDownLeft size={20} color="#10B981" />
                )}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>
                  {transaction.recipientName}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.timestamp)}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'sent' 
                  ? styles.amountSent 
                  : styles.amountReceived
              ]}>
                {transaction.type === 'sent' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 24,
  },
  safeArea: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  balance: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  recipientsScroll: {
    gap: 12,
  },
  recipientCard: {
    alignItems: 'center',
    width: 80,
  },
  recipientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  recipientInitial: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  recipientName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1E293B',
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  amountSent: {
    color: '#EF4444',
  },
  amountReceived: {
    color: '#10B981',
  },
});
