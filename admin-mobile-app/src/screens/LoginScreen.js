import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DEFAULT_API_BASE, loginAdmin, setApiConfig, sanitizeClientInput } from '../services/api';
import { saveAdminSession } from '../services/session';

export default function LoginScreen({ onLoginSuccess, isSessionExpired = false }) {
  const [email, setEmail] = useState('admin@rustyaircooled.com');
  const [password, setPassword] = useState('admin123');
  const [serverUrl, setServerUrl] = useState(DEFAULT_API_BASE);
  const [useTokenMode, setUseTokenMode] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    setErrorMsg('');

    // Sanitization & validation
    const cleanUrl = sanitizeClientInput(serverUrl);
    if (!cleanUrl) {
      setErrorMsg('Please specify the Backend Server URL');
      return;
    }

    if (useTokenMode) {
      const cleanToken = sanitizeClientInput(tokenInput);
      if (!cleanToken) {
        setErrorMsg('Please enter your Admin Access Token');
        return;
      }

      setIsLoading(true);
      try {
        setApiConfig(cleanUrl, cleanToken);
        const res = await fetch(`${cleanUrl}/api/admin/chat/conversations`, {
          headers: { 'Authorization': `Bearer ${cleanToken}` }
        });
        if (!res.ok) throw new Error('Invalid Token or Server Unreachable');

        const session = await saveAdminSession({
          token: cleanToken,
          user: { name: 'Master Admin Engineer', email: 'admin@token.auth', role: 'ADMIN' },
          serverUrl: cleanUrl,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });

        onLoginSuccess(session);
      } catch (err) {
        setErrorMsg(err.message || 'Token authentication failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const cleanEmail = sanitizeClientInput(email);
    const cleanPassword = sanitizeClientInput(password);

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Admin email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with backend API (issues 7-day JWT)
      const loginResult = await loginAdmin({
        email: cleanEmail,
        password: cleanPassword,
        serverUrl: cleanUrl,
      });

      // 2. Persist session with 7-day expiration
      const session = await saveAdminSession({
        token: loginResult.token,
        user: loginResult.user,
        expiresAt: loginResult.expiresAt,
        serverUrl: cleanUrl,
      });

      // 3. Complete authentication
      onLoginSuccess(session);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header / Brand */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="car-wrench" size={40} color="#ff7a1a" />
          </View>
          <Text style={styles.badge}>SECURE ADMIN DISPATCH PORTAL</Text>
          <Text style={styles.title}>Vintage VW Works</Text>
          <Text style={styles.subtitle}>
            Specialist Live Reply & Notification Desk
          </Text>
        </View>

        {/* Expiration Banner */}
        {isSessionExpired && (
          <View style={styles.expiredBanner}>
            <MaterialCommunityIcons name="clock-alert" size={18} color="#f59e0b" />
            <Text style={styles.expiredText}>
              Your 7-day session expired for security. Please sign in again.
            </Text>
          </View>
        )}

        {/* Auth Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>ADMIN SIGN IN</Text>
              <Text style={styles.cardSubtitle}>Requires authenticated workshop access</Text>
            </View>
            <View style={styles.sessionPill}>
              <MaterialCommunityIcons name="shield-lock" size={12} color="#10b981" />
              <Text style={styles.sessionPillText}>7-DAY SESSION</Text>
            </View>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {!useTokenMode ? (
            <>
              {/* Admin Email */}
              <Text style={styles.inputLabel}>ADMIN EMAIL</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="email-outline" size={18} color="#ff7a1a" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="admin@rustyaircooled.com"
                  placeholderTextColor="#786154"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              {/* Admin Password */}
              <Text style={styles.inputLabel}>ADMIN PASSWORD</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="lock-outline" size={18} color="#ff7a1a" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#786154"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#a78b7d"
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Token Mode Input */}
              <Text style={styles.inputLabel}>ADMIN BEARER TOKEN / PASSKEY</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="key-variant" size={18} color="#ff7a1a" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Paste JWT / Admin Key..."
                  placeholderTextColor="#786154"
                  value={tokenInput}
                  onChangeText={setTokenInput}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {/* Backend Server URL */}
          <Text style={styles.inputLabel}>BACKEND API URL</Text>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="server-network" size={18} color="#83cffb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://vv-classic-works.onrender.com"
              placeholderTextColor="#786154"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Mode Switcher */}
          <TouchableOpacity
            onPress={() => {
              setUseTokenMode(!useTokenMode);
              setErrorMsg('');
            }}
            style={styles.switchModeBtn}
          >
            <Text style={styles.switchModeText}>
              {useTokenMode ? '← Use Email & Password Sign In' : '🔑 Or sign in with Secret Token / Passkey'}
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <MaterialCommunityIcons name="login" size={20} color="#000" />
                <Text style={styles.buttonText}>SIGN IN & OPEN DESK</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.securityBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#10b981" />
            <Text style={styles.securityText}>
              Protected with parameterized SQL filters & 7-day session token
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Aircooled VW Works Houston, TX • Admin Mobile Gateway
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131314',
  },
  scrollContent: {
    padding: 22,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1c1b1d',
    borderWidth: 1.5,
    borderColor: '#ff7a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#ff7a1a',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  badge: {
    color: '#ff7a1a',
    fontSize: 9.5,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#a78b7d',
    textAlign: 'center',
    marginTop: 3,
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  expiredText: {
    color: '#fcd34d',
    fontSize: 11,
    flex: 1,
  },
  card: {
    backgroundColor: '#1c1b1d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#584236',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  cardSubtitle: {
    fontSize: 10.5,
    color: '#a78b7d',
    marginTop: 2,
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  sessionPillText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 11,
    flex: 1,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#ff7a1a',
    letterSpacing: 1,
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131314',
    borderWidth: 1,
    borderColor: '#584236',
    borderRadius: 4,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 42,
    color: '#ffffff',
    fontSize: 13,
  },
  eyeBtn: {
    padding: 6,
  },
  switchModeBtn: {
    paddingVertical: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#83cffb',
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#ff7a1a',
    height: 46,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6,
  },
  securityText: {
    color: '#10b981',
    fontSize: 9.5,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#584236',
    fontSize: 9.5,
    textAlign: 'center',
  },
});
