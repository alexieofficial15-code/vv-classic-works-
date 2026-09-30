import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchConversations, registerPushToken, unregisterPushToken } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';

export default function ConversationsScreen({
  onSelectConversation,
  onOpenSettings,
  notificationsEnabled,
  onToggleNotifications,
}) {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Could not fetch customer threads. Swipe down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load & Polling every 5 seconds for new customer messages
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = conversations.filter(
      (c) =>
        (c.userName && c.userName.toLowerCase().includes(q)) ||
        (c.userEmail && c.userEmail.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const renderItem = ({ item }) => {
    const hasUnread = item.unreadCount > 0;
    const initial = (item.userName || item.userEmail || 'C').charAt(0).toUpperCase();

    const formattedTime = item.lastMessageAt
      ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity
        style={[styles.card, hasUnread && styles.cardUnread]}
        onPress={() => onSelectConversation(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={[styles.avatar, hasUnread ? styles.avatarUnread : styles.avatarNormal]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.customerName, hasUnread && styles.customerNameUnread]} numberOfLines={1}>
              {item.userName || 'Restorer Customer'}
            </Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>

          <Text style={styles.customerEmail} numberOfLines={1}>
            {item.userEmail || `ID: ${item.userId}`}
          </Text>

          <Text style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} numberOfLines={2}>
            {item.lastMessage || 'Customer inquiry started...'}
          </Text>
        </View>

        {/* Unread badge & arrow */}
        <View style={styles.cardEnd}>
          {hasUnread ? (
            <View style={styles.badgeUnread}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          ) : (
            <MaterialCommunityIcons name="chevron-right" size={20} color="#584236" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <View style={styles.topBar}>
        <View>
          <View style={styles.brandRow}>
            <MaterialCommunityIcons name="car-wrench" size={20} color="#ff7a1a" />
            <Text style={styles.brandTitle}>VW ADMIN DESK</Text>
            {totalUnread > 0 && (
              <View style={styles.headerAlertPill}>
                <Text style={styles.headerAlertText}>{totalUnread} NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.brandSubtitle}>Customer Inquiries & Live Replies</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings}>
          <MaterialCommunityIcons name="cog" size={22} color="#e0c0b1" />
        </TouchableOpacity>
      </View>

      {/* Notifications Switch Strip */}
      <View style={styles.notifBanner}>
        <View style={styles.notifInfo}>
          <MaterialCommunityIcons
            name={notificationsEnabled ? 'bell-ring' : 'bell-off'}
            size={18}
            color={notificationsEnabled ? '#ff7a1a' : '#786154'}
          />
          <View style={styles.notifTextWrap}>
            <Text style={styles.notifTitle}>
              {notificationsEnabled ? 'Phone Push Notifications ON' : 'Notifications Paused'}
            </Text>
            <Text style={styles.notifSub}>
              {notificationsEnabled ? 'Phone rings when customer messages' : 'Toggle on to receive alerts'}
            </Text>
          </View>
        </View>

        <Switch
          value={notificationsEnabled}
          onValueChange={onToggleNotifications}
          trackColor={{ false: '#3a383a', true: '#ff7a1a' }}
          thumbColor={notificationsEnabled ? '#ffffff' : '#a78b7d'}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={18} color="#786154" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customer name, email, inquiry..."
          placeholderTextColor="#786154"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={16} color="#a78b7d" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Conversation List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff7a1a" />
          <Text style={styles.loadingText}>Syncing customer conversations...</Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="chat-outline" size={48} color="#584236" />
          <Text style={styles.emptyTitle}>No Customer Inquiries Yet</Text>
          <Text style={styles.emptySubtitle}>
            When a customer sends a message on the website, it will immediately appear here and sound an alert on your phone.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.userId || item.id || String(Math.random())}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              tintColor="#ff7a1a"
              colors={['#ff7a1a']}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131314',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#181719',
    borderBottomWidth: 1,
    borderBottomColor: '#2b2628',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#a78b7d',
    marginTop: 2,
  },
  headerAlertPill: {
    backgroundColor: '#ff7a1a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  headerAlertText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#201f20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#584236',
  },
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c1b1d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#352f31',
  },
  notifInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  notifTextWrap: {
    flex: 1,
  },
  notifTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notifSub: {
    color: '#a78b7d',
    fontSize: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181719',
    borderWidth: 1,
    borderColor: '#3a3335',
    marginHorizontal: 14,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
  },
  listContainer: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1a1c',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3a3335',
    padding: 12,
    marginBottom: 8,
  },
  cardUnread: {
    borderColor: '#ff7a1a',
    backgroundColor: '#211e1f',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarNormal: {
    backgroundColor: '#262426',
    borderWidth: 1,
    borderColor: '#584236',
  },
  avatarUnread: {
    backgroundColor: '#ff7a1a',
    borderWidth: 1,
    borderColor: '#ffb68e',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#e5e2e3',
    flex: 1,
    marginRight: 8,
  },
  customerNameUnread: {
    color: '#ff7a1a',
  },
  timeText: {
    fontSize: 10,
    color: '#a78b7d',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  customerEmail: {
    fontSize: 10,
    color: '#83cffb',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 11,
    color: '#9e9087',
    lineHeight: 15,
  },
  lastMessageUnread: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cardEnd: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnread: {
    backgroundColor: '#ff7a1a',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#a78b7d',
    fontSize: 12,
    marginTop: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#a78b7d',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 8,
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 4,
  },
  errorText: {
    color: '#f87171',
    fontSize: 11,
    textAlign: 'center',
  },
});
