import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import LoginScreen from './src/screens/LoginScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import ChatReplyScreen from './src/screens/ChatReplyScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import {
  registerForPushNotificationsAsync,
  triggerLocalNotification,
} from './src/services/notifications';
import {
  registerPushToken,
  unregisterPushToken,
  fetchConversations,
  setApiConfig,
} from './src/services/api';
import {
  getAdminSession,
  clearAdminSession,
} from './src/services/session';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('conversations'); // 'conversations' | 'chat' | 'settings'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushToken, setPushToken] = useState(null);

  const prevUnreadCountRef = useRef(0);
  const notificationListenerRef = useRef();
  const responseListenerRef = useRef();

  // 1. Initial 7-Day Session Verification on App Startup
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const sessionCheck = await getAdminSession();
        if (sessionCheck.isValid && sessionCheck.session) {
          // Valid, unexpired (< 7 days) admin session
          setApiConfig(sessionCheck.session.serverUrl, sessionCheck.session.token);
          setIsAuthenticated(true);
          setIsSessionExpired(false);
          setCurrentScreen('conversations');
        } else if (sessionCheck.isExpired) {
          // Session expired after 7 days
          setIsAuthenticated(false);
          setIsSessionExpired(true);
        } else {
          // Not signed in
          setIsAuthenticated(false);
          setIsSessionExpired(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    }

    checkExistingSession();
  }, []);

  // 2. Initialize Push Notifications & Register with Backend when Authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    async function setupNotifications() {
      const result = await registerForPushNotificationsAsync();
      if (result.success && result.token) {
        if (isMounted) setPushToken(result.token);
        await registerPushToken(result.token).catch(() => {});
      }
    }

    setupNotifications();

    try {
      notificationListenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log('Push notification received in foreground:', notification);
      });

      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response?.notification?.request?.content?.data;
        if (data && data.userId) {
          setSelectedConversation({
            userId: data.userId,
            userName: data.userName || 'Restorer Customer',
          });
          setCurrentScreen('chat');
        }
      });
    } catch (e) {
      console.warn('Notification listener registration note:', e.message);
    }

    return () => {
      isMounted = false;
      try {
        if (notificationListenerRef.current) {
          Notifications.removeNotificationSubscription(notificationListenerRef.current);
        }
        if (responseListenerRef.current) {
          Notifications.removeNotificationSubscription(responseListenerRef.current);
        }
      } catch (_) {}
    };
  }, [isAuthenticated]);

  // 3. Active in-app watcher: sound/vibration alert when new customer messages arrive
  useEffect(() => {
    if (!isAuthenticated || !notificationsEnabled) return;

    const checkNewMessages = async () => {
      try {
        const convos = await fetchConversations();
        const currentUnread = convos.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

        if (currentUnread > prevUnreadCountRef.current && prevUnreadCountRef.current !== 0) {
          const newConvo = convos.find((c) => c.unreadCount > 0);
          const sender = newConvo?.userName || 'A Customer';
          const preview = newConvo?.lastMessage || 'New inquiry about vehicle parts.';

          triggerLocalNotification({
            title: `💬 New Message from ${sender}`,
            body: preview,
            data: { userId: newConvo?.userId, userName: sender },
          });
        }
        prevUnreadCountRef.current = currentUnread;
      } catch (err) {
        if (err.message === 'SESSION_EXPIRED') {
          // Token expired while using app
          await clearAdminSession();
          setIsAuthenticated(false);
          setIsSessionExpired(true);
        }
      }
    };

    const interval = setInterval(checkNewMessages, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, notificationsEnabled]);

  // Toggle Push Notifications Handler
  const handleToggleNotifications = async (val) => {
    setNotificationsEnabled(val);
    if (!val) {
      if (pushToken) await unregisterPushToken(pushToken);
    } else {
      if (pushToken) await registerPushToken(pushToken);
    }
  };

  const handleLoginSuccess = (session) => {
    setIsAuthenticated(true);
    setIsSessionExpired(false);
    setCurrentScreen('conversations');
  };

  const handleLogout = async () => {
    await clearAdminSession();
    setIsAuthenticated(false);
    setIsSessionExpired(false);
    setSelectedConversation(null);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setCurrentScreen('chat');
  };

  if (isInitializing) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#ff7a1a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#131314" />
      <View style={styles.container}>
        {!isAuthenticated ? (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            isSessionExpired={isSessionExpired}
          />
        ) : currentScreen === 'chat' && selectedConversation ? (
          <ChatReplyScreen
            conversation={selectedConversation}
            onBack={() => {
              setSelectedConversation(null);
              setCurrentScreen('conversations');
            }}
          />
        ) : currentScreen === 'settings' ? (
          <SettingsScreen
            onBack={() => setCurrentScreen('conversations')}
            onLogout={handleLogout}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
            pushToken={pushToken}
          />
        ) : (
          <ConversationsScreen
            onSelectConversation={handleSelectConversation}
            onOpenSettings={() => setCurrentScreen('settings')}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#131314',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#131314',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#131314',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
