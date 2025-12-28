import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { Search, UserPlus, Phone } from 'lucide-react-native';
import { useAppStore } from '@/store';
import type { Recipient } from '@/types';

export default function RecipientsScreen() {
  const router = useRouter();
  const { recipients, addRecipient } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>(recipients);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = recipients.filter(recipient => 
        recipient.name.toLowerCase().includes(query) ||
        recipient.accountNumber.toLowerCase().includes(query)
      );
      setFilteredRecipients(filtered);
    } else {
      setFilteredRecipients(recipients);
    }
  }, [searchQuery, recipients]);

  const requestContactsPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Contact access is not available on web.');
      return;
    }

    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      loadContacts();
    } else {
      Alert.alert('Permission Denied', 'Please enable contacts permission to import recipients.');
    }
  };

  const loadContacts = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        const contactOptions = data
          .filter(contact => contact.name && contact.phoneNumbers?.[0])
          .slice(0, 10)
          .map(contact => ({
            name: contact.name || 'Unknown',
            phoneNumber: contact.phoneNumbers![0].number || '',
          }));

        Alert.alert(
          'Import Contacts',
          `Found ${contactOptions.length} contacts. This is a demo, so contacts will be added with mock account numbers.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Import', 
              onPress: () => {
                contactOptions.forEach(contact => {
                  const newRecipient: Recipient = {
                    id: Date.now().toString() + Math.random().toString(),
                    name: contact.name,
                    accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
                    phoneNumber: contact.phoneNumber,
                  };
                  addRecipient(newRecipient);
                });
                Alert.alert('Success', `Imported ${contactOptions.length} contacts as recipients.`);
              }
            },
          ]
        );
      } else {
        Alert.alert('No Contacts', 'No contacts found on your device.');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    }
  };

  const handleSelectRecipient = (recipient: Recipient) => {
    router.push({
      pathname: '/transfer',
      params: { recipientId: recipient.id },
    });
  };

  const renderRecipient = ({ item }: { item: Recipient }) => (
    <TouchableOpacity 
      style={styles.recipientItem}
      onPress={() => handleSelectRecipient(item)}
    >
      <View style={styles.recipientAvatar}>
        <Text style={styles.recipientInitial}>
          {item.name.charAt(0)}
        </Text>
      </View>
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientName}>{item.name}</Text>
        <Text style={styles.recipientAccount}>
          {item.bankName ? `${item.bankName} • ` : ''}{item.accountNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipients..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.importButton}
          onPress={requestContactsPermission}
        >
          <Phone size={20} color="#3B82F6" />
          <Text style={styles.importButtonText}>Import</Text>
        </TouchableOpacity>
      </View>

      {filteredRecipients.length === 0 ? (
        <View style={styles.emptyState}>
          <UserPlus size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Recipients Found</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery 
              ? 'Try a different search term' 
              : 'Import contacts or add recipients manually'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipients}
          renderItem={renderRecipient}
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
  header: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  importButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recipientItem: {
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
  recipientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recipientInitial: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  recipientInfo: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
