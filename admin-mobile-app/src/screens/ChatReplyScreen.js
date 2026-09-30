import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchCustomerMessages, sendAdminReply } from '../services/api';

const QUICK_REPLIES = [
  'Yes, we have that vintage part in stock and ready for dispatch.',
  'Could you share your vehicle year and engine code so we can verify fitment?',
  'Our workshop can build a complete turnkey crate engine for your VW.',
  'We are preparing your formal quote and will email you shortly.',
  'Feel free to upload photos of the part or engine bay in your dashboard.',
];

export default function ChatReplyScreen({ conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const flatListRef = useRef(null);

  const userId = conversation?.userId;
  const userEmail = conversation?.userEmail;
  const customerName = conversation?.userName || userEmail || 'Restorer Member';

  // Load conversation messages
  const loadMessages = async () => {
    if (!userId) return;
    try {
      const data = await fetchCustomerMessages(userId, userEmail);
      setMessages(data);
      setErrorMsg('');
    } catch (err) {
      console.warn('Error loading customer messages:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Poll every 3 seconds for new customer replies while in chat
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId, userEmail]);

  // Handle Send Reply
  const handleSend = async (customMessage) => {
    const textToSend = customMessage || replyText;
    if (!textToSend || !textToSend.trim() || isSending) return;

    const trimmed = textToSend.trim();
    setReplyText('');
    setIsSending(true);

    // Optimistic local append
    const optimisticMessage = {
      id: `admin-opt-${Date.now()}`,
      userId,
      userName: customerName,
      userEmail,
      senderRole: 'ADMIN',
      senderName: 'Master Admin Engineer',
      message: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendAdminReply({
        userId,
        userName: customerName,
        userEmail,
        message: trimmed,
      });
      // Refresh to confirm persistence
      loadMessages();
    } catch (err) {
      setErrorMsg('Failed to send reply. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isAdmin = item.senderRole === 'ADMIN';
    const timeStr = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={[styles.msgRow, isAdmin ? styles.msgRowAdmin : styles.msgRowCustomer]}>
        <View style={[styles.bubble, isAdmin ? styles.bubbleAdmin : styles.bubbleCustomer]}>
          {/* Header */}
          <View style={styles.bubbleHeader}>
            <Text style={[styles.senderLabel, isAdmin ? styles.senderLabelAdmin : styles.senderLabelCustomer]}>
              {isAdmin ? '🔧 LEAD SPECIALIST (YOU)' : `👤 ${item.userName || customerName}`}
            </Text>
            <Text style={[styles.timeLabel, isAdmin ? styles.timeLabelAdmin : styles.timeLabelCustomer]}>
              {timeStr}
            </Text>
          </View>

          {/* Message Text */}
          <Text style={[styles.msgText, isAdmin ? styles.msgTextAdmin : styles.msgTextCustomer]}>
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {customerName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {userEmail || `User ID: ${userId}`}
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>ACTIVE</Text>
        </View>
      </View>

      {/* Quick Reply Chips Strip */}
      <View style={styles.quickRepliesStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
          <View style={styles.quickLabelWrap}>
            <Text style={styles.quickLabel}>QUICK REPLIES:</Text>
          </View>
          {QUICK_REPLIES.map((reply, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickChip}
              onPress={() => handleSend(reply)}
            >
              <Text style={styles.quickChipText} numberOfLines={1}>
                {reply}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Error Message */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Message List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff7a1a" />
          <Text style={styles.loadingText}>Loading conversation history...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="message-text-outline" size={44} color="#584236" />
          <Text style={styles.emptyTitle}>Customer thread opened</Text>
          <Text style={styles.emptySubtitle}>
            Reply to {customerName} below to guide them on vehicle parts or engine rebuilds.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input Reply Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={`Reply to ${customerName}...`}
          placeholderTextColor="#786154"
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!replyText.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!replyText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <MaterialCommunityIcons name="send" size={20} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131314',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181719',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2628',
  },
  backBtn: {
    padding: 8,
    marginRight: 6,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#83cffb',
    fontSize: 11,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#201f20',
    borderWidth: 1,
    borderColor: '#39b54a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#39b54a',
  },
  onlineText: {
    color: '#39b54a',
    fontSize: 9,
    fontWeight: 'bold',
  },
  quickRepliesStrip: {
    backgroundColor: '#1c1b1d',
    borderBottomWidth: 1,
    borderBottomColor: '#302a2c',
    paddingVertical: 6,
  },
  quickScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  quickLabelWrap: {
    marginRight: 4,
  },
  quickLabel: {
    color: '#ff7a1a',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  quickChip: {
    backgroundColor: '#262426',
    borderWidth: 1,
    borderColor: '#584236',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 220,
  },
  quickChipText: {
    color: '#e0c0b1',
    fontSize: 10,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  msgRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  msgRowCustomer: {
    justifyContent: 'flex-start',
  },
  msgRowAdmin: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleCustomer: {
    backgroundColor: '#1f1e20',
    borderWidth: 1,
    borderColor: '#3a3335',
  },
  bubbleAdmin: {
    backgroundColor: '#ff7a1a',
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  senderLabelCustomer: {
    color: '#83cffb',
  },
  senderLabelAdmin: {
    color: '#1a1819',
  },
  timeLabel: {
    fontSize: 9,
  },
  timeLabelCustomer: {
    color: '#786154',
  },
  timeLabelAdmin: {
    color: '#3d2508',
  },
  msgText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  msgTextCustomer: {
    color: '#ffffff',
  },
  msgTextAdmin: {
    color: '#000000',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181719',
    borderTopWidth: 1,
    borderTopColor: '#2b2628',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#131314',
    borderWidth: 1,
    borderColor: '#584236',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    color: '#ffffff',
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: '#ff7a1a',
    width: 44,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#a78b7d',
    fontSize: 11,
    marginTop: 10,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptySubtitle: {
    color: '#a78b7d',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 8,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 4,
  },
  errorText: {
    color: '#f87171',
    fontSize: 11,
    textAlign: 'center',
  },
});
