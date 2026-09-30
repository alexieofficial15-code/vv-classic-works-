// Push & Local Notification Service for Admin Mobile App
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for Android & iOS Push Notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('admin-replies', {
      name: 'Customer Inquiries & Replies',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff7a1a',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return { success: false, message: 'Notification permission not granted' };
    }
    try {
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      token = pushTokenData.data;
    } catch (err) {
      console.warn('Could not get push token:', err.message);
      token = 'simulator-token-' + Device.modelName;
    }
  } else {
    // Simulator or Expo Go fallback
    token = 'sim-token-' + Date.now();
  }

  return { success: true, token };
}

// Trigger an immediate local notification (used when new message arrives via polling or test)
export async function triggerLocalNotification({ title, body, data = {} }) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#ff7a1a',
        data,
      },
      trigger: null, // trigger immediately
    });
  } catch (err) {
    console.warn('triggerLocalNotification error:', err.message);
  }
}
