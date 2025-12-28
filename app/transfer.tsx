import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { ArrowRight, User } from 'lucide-react-native';
import { useAppStore } from '@/store';
import type { Recipient } from '@/types';

export default function TransferScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { account, getRecipientById, addTransaction, updateBalance } = useAppStore();
  
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (params.recipientId && typeof params.recipientId === 'string') {
      const recipient = getRecipientById(params.recipientId);
      if (recipient) {
        setSelectedRecipient(recipient);
      }
    }
  }, [params.recipientId, getRecipientById]);

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1]?.length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Error', 'Biometric authentication is not available on this device.');
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No biometric authentication is enrolled on this device.');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to confirm payment',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use passcode',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
      return false;
    }
  };

  const validateTransfer = (): string | null => {
    if (!selectedRecipient) {
      return 'Please select a recipient';
    }

    const transferAmount = parseFloat(amount);
    if (!amount || isNaN(transferAmount) || transferAmount <= 0) {
      return 'Please enter a valid amount';
    }

    if (transferAmount > account.balance) {
      return 'Insufficient funds';
    }

    return null;
  };

  const processTransfer = async () => {
    const error = validateTransfer();
    if (error) {
      Alert.alert('Invalid Transfer', error);
      return;
    }

    setIsProcessing(true);

    try {
      const authenticated = await authenticateWithBiometrics();
      
      if (!authenticated) {
        setIsProcessing(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const transferAmount = parseFloat(amount);
      const newBalance = account.balance - transferAmount;

      const transaction = {
        id: Date.now().toString(),
        recipientId: selectedRecipient!.id,
        recipientName: selectedRecipient!.name,
        amount: transferAmount,
        note: note || undefined,
        timestamp: Date.now(),
        status: 'completed' as const,
        type: 'sent' as const,
      };

      updateBalance(newBalance);
      addTransaction(transaction);

      router.replace({
        pathname: '/confirmation',
        params: {
          transactionId: transaction.id,
          recipientName: selectedRecipient!.name,
          amount: transferAmount.toString(),
          newBalance: newBalance.toString(),
        },
      });
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Transfer Failed', 'An error occurred while processing your transfer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${account.balance.toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Recipient</Text>
          {selectedRecipient ? (
            <View style={styles.selectedRecipient}>
              <View style={styles.recipientInfo}>
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientInitial}>
                    {selectedRecipient.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.recipientDetails}>
                  <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
                  <Text style={styles.recipientAccount}>
                    {selectedRecipient.bankName} • {selectedRecipient.accountNumber}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={() => router.push('/recipients')}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.selectRecipientButton}
              onPress={() => router.push('/recipients')}
            >
              <User size={24} color="#64748B" />
              <Text style={styles.selectRecipientText}>Select Recipient</Text>
              <ArrowRight size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>RM</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={100}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!selectedRecipient || !amount || isProcessing) && styles.sendButtonDisabled
          ]}
          onPress={processTransfer}
          disabled={!selectedRecipient || !amount || isProcessing}
        >
          <Text style={styles.sendButtonText}>
            {isProcessing ? 'Processing...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E293B',
    marginBottom: 12,
  },
  selectRecipientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectRecipientText: {
    flex: 1,
    fontSize: 16,
    color: '#64748B',
  },
  selectedRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recipientInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E293B',
    marginBottom: 4,
  },
  recipientAccount: {
    fontSize: 14,
    color: '#64748B',
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1E293B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1E293B',
    padding: 0,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
