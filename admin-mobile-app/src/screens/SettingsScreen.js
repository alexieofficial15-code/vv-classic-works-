import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiConfig, setApiConfig, sendTestPush } from '../services/api';
import { triggerLocalNotification } from '../services/notifications';
import { getAdminSession, getRemainingSessionTime, clearAdminSession } from '../services/session';

export default function SettingsScreen({
  onBack,
  onLogout,
  notificationsEnabled,
  onToggleNotifications,
  pushToken,
}) {
  const currentConfig = getApiConfig();
  const [serverUrl, setServerUrl] = useState(currentConfig.baseUrl);
  const [token, setToken] = useState(currentConfig.token);
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    async function loadSession() {
      const res = await getAdminSession();
      if (res.isValid && res.session) {
        setCurrentSession(res.session);
      }
    }
    loadSession();
  }, []);

  const handleSaveConnection = () => {
    setApiConfig(serverUrl.trim(), token.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestAlert = async () => {
    setIsTestingAlert(true);
    try {
      // 1. Trigger immediate local notification
      await triggerLocalNotification({
        title: '🔔 Workshop Specialist Alert',
        body: 'Push notifications are active and working on your Android phone!',
      });

      // 2. Also trigger backend Expo push test if token exists
      if (pushToken) {
        await sendTestPush(pushToken).catch(() => {});
      }

      Alert.alert('Notification Test', 'Alert dispatched! You should hear a sound and feel a vibration.');
    } catch (err) {
      Alert.alert('Test Failed', err.message);
    } finally {
      setIsTestingAlert(false);
    }
  };

  const handleManualLogout = async () => {
    await clearAdminSession();
    onLogout();
  };

  const sessionRemaining = getRemainingSessionTime(currentSession);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADMIN APP SETTINGS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Section 0: Session & Security Badge */}
        <Text style={styles.sectionHeader}>SESSION & ACCESS SECURITY</Text>
        <View style={styles.card}>
          <View style={styles.sessionHeaderRow}>
            <View style={styles.adminInfoWrap}>
              <MaterialCommunityIcons name="shield-account" size={24} color="#ff7a1a" />
              <View>
                <Text style={styles.adminName}>
                  {currentSession?.user?.name || 'Master Admin Engineer'}
                </Text>
                <Text style={styles.adminEmail}>
                  {currentSession?.user?.email || 'Admin'}
                </Text>
              </View>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>AUTHENTICATED</Text>
            </View>
          </View>

          <View style={styles.sessionDetailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Session Policy:</Text>
              <Text style={styles.detailValue}>7 Days Expiration</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time Remaining:</Text>
              <Text style={[styles.detailValue, { color: '#10b981', fontWeight: 'bold' }]}>
                {sessionRemaining || 'Active (7-day validity)'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Database Sync:</Text>
              <Text style={styles.detailValue}>Direct to 'messages' table</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SQL Sanitization:</Text>
              <Text style={[styles.detailValue, { color: '#83cffb' }]}>Active (Parameterized)</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Notifications */}
        <Text style={styles.sectionHeader}>NOTIFICATION ALERTS</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <View style={styles.rowTitleWrap}>
                <MaterialCommunityIcons name="bell-ring" size={18} color="#ff7a1a" />
                <Text style={styles.settingTitle}>Phone Push Notifications</Text>
              </View>
              <Text style={styles.settingSubtitle}>
                Alert your phone instantly whenever a customer sends a message on the website.
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ false: '#3a383a', true: '#ff7a1a' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#a78b7d'}
            />
          </View>

          {/* Test Alert Button */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestAlert}
            disabled={isTestingAlert}
          >
            {isTestingAlert ? (
              <ActivityIndicator color="#ff7a1a" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="cellphone-sound" size={18} color="#ff7a1a" />
                <Text style={styles.testBtnText}>TEST NOTIFICATION SOUND & VIBRATION</Text>
              </>
            )}
          </TouchableOpacity>

          {pushToken ? (
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>REGISTERED DEVICE PUSH TOKEN:</Text>
              <Text style={styles.tokenValue} numberOfLines={1}>
                {pushToken}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Section 2: Server Connection */}
        <Text style={styles.sectionHeader}>BACKEND SERVER CONNECTION</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>SERVER API ENDPOINT</Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            placeholderTextColor="#786154"
          />

          <Text style={styles.inputLabel}>ADMIN AUTHORIZATION TOKEN</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            secureTextEntry
            autoCapitalize="none"
            placeholderTextColor="#786154"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveConnection}>
            <MaterialCommunityIcons name="check" size={16} color="#000" />
            <Text style={styles.saveBtnText}>
              {saveSuccess ? 'SAVED SUCCESSFULLY!' : 'UPDATE CONNECTION'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleManualLogout}>
          <MaterialCommunityIcons name="logout" size={18} color="#ef4444" />
          <Text style={styles.logoutBtnText}>LOG OUT & EXPIRE SESSION</Text>
        </TouchableOpacity>

        {/* About Card */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Vintage Aircooled VW Works</Text>
          <Text style={styles.aboutText}>
            Lead Specialist Customer Response Terminal • Android Edition
          </Text>
          <Text style={styles.aboutVersion}>v1.0.0 (Expo React Native)</Text>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2628',
  },
  backBtn: {
    padding: 8,
    marginRight: 6,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    color: '#ff7a1a',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1c1b1d',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3a3335',
    padding: 16,
    marginBottom: 16,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  adminEmail: {
    color: '#a78b7d',
    fontSize: 11,
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePillText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
  },
  sessionDetailsBox: {
    backgroundColor: '#131314',
    borderRadius: 4,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#786154',
    fontSize: 11,
  },
  detailValue: {
    color: '#d1c7bd',
    fontSize: 11,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  rowTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  settingSubtitle: {
    color: '#a78b7d',
    fontSize: 11,
    lineHeight: 15,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262426',
    borderWidth: 1,
    borderColor: '#ff7a1a',
    borderRadius: 4,
    paddingVertical: 10,
    marginTop: 14,
    gap: 8,
  },
  testBtnText: {
    color: '#ff7a1a',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tokenBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2b2628',
  },
  tokenLabel: {
    color: '#786154',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  tokenValue: {
    color: '#83cffb',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  inputLabel: {
    color: '#a78b7d',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#131314',
    borderWidth: 1,
    borderColor: '#584236',
    borderRadius: 4,
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#ff7a1a',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 6,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aboutCard: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  aboutTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aboutText: {
    color: '#786154',
    fontSize: 10,
    marginTop: 2,
  },
  aboutVersion: {
    color: '#ff7a1a',
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
