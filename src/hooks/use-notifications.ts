import { useState, useEffect } from 'react';
import { 
  initializeNotifications, 
  saveFCMToken, 
  setupMessageListener,
  isNotificationSupported,
  getNotificationPermission 
} from '@/lib/notifications';
import { useAuth } from '@/firebase';

export function useNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (user && isSupported && permission === 'granted') {
      initializeNotificationSystem();
    }
  }, [user, isSupported, permission]);

  const initializeNotificationSystem = async () => {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      }

      // Initialize notifications
      const token = await initializeNotifications();
      
      if (token && user) {
        // Save FCM token to user profile
        await saveFCMToken(user.uid, token);
        console.log('FCM token saved for user:', user.uid);
      }

      // Set up message listener
      setupMessageListener();

      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Error initializing notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize notifications');
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (!isSupported) {
        setError('Notifications are not supported in this browser');
        return false;
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await initializeNotificationSystem();
        return true;
      } else {
        setError('Notification permission denied');
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError(err instanceof Error ? err.message : 'Failed to request permission');
      return false;
    }
  };

  const checkPermission = (): NotificationPermission | null => {
    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);
    return currentPermission;
  };

  return {
    isSupported,
    permission,
    isInitialized,
    error,
    requestPermission,
    checkPermission
  };
}
