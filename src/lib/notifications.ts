import { getMessaging, getToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getDb, getApp } from './firestore';

// Get Firebase instances
const app = getApp();
const db = getDb();

// Lazy initialize messaging only when needed and supported
let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }
  
  // Check if browser supports messaging
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('Firebase Messaging not supported in this browser');
    return null;
  }
  
  // Check if running on HTTPS (required for FCM)
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    console.warn('Firebase Messaging requires HTTPS');
    return null;
  }
  
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.warn('Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }
  
  return messaging;
}

// Notification types
export enum NotificationType {
  WEATHER_ALERT = 'weather_alert',
  DISEASE_WARNING = 'disease_warning',
  TREATMENT_REMINDER = 'treatment_reminder',
  MARKET_UPDATE = 'market_update',
  SYSTEM_UPDATE = 'system_update'
}

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// VAPID key for push notifications
const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'your-vapid-key';

// Initialize notifications
export async function initializeNotifications(): Promise<string | null> {
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      console.log('Messaging not supported in this environment');
      return null;
    }
    
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
}

// Save FCM token to user profile
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId), {
      fcmToken: token,
      lastTokenUpdate: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

// Send notification to user
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, string>,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  scheduledFor?: Date
): Promise<void> {
  try {
    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      body,
      data,
      read: false,
      createdAt: new Date(),
      scheduledFor,
      priority
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'notifications', notification.id), notification);
    
    // Send push notification if user is online
    await sendPushNotification(userId, title, body, data);
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Send push notification via FCM
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    // In production, this would be done via Cloud Functions
    // For now, we'll just log it
    console.log('Sending push notification:', { userId, title, body, data });
    
    // You would typically call a Cloud Function here:
    // await fetch('/api/send-notification', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, title, body, data })
    // });
    
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Get user notifications
export async function getUserNotifications(
  userId: string,
  limitCount: number = 50
): Promise<NotificationData[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      scheduledFor: doc.data().scheduledFor?.toDate()
    })) as NotificationData[];
    
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await setDoc(doc(db, 'notifications', notificationId), {
      read: true
    }, { merge: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notifications = await getUserNotifications(userId);
    const unreadNotifications = notifications.filter(n => !n.read);
    
    const batch = unreadNotifications.map(notification =>
      setDoc(doc(db, 'notifications', notification.id), {
        read: true
      }, { merge: true })
    );
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// Set up message listener
export function setupMessageListener(): void {
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      console.log('Message listener not available - messaging not supported');
      return;
    }
    
    onMessage(messagingInstance, (payload: MessagePayload) => {
      console.log('Message received:', payload);
      
      // Show notification
      if (payload.notification) {
        const { title, body } = payload.notification;
        
        // Create browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title || 'AgriSahayak', {
            body: body || '',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'agrisahayak-notification'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
  }
}

// Weather alert notification
export async function sendWeatherAlert(
  userId: string,
  location: string,
  alert: string,
  severity: 'low' | 'medium' | 'high'
): Promise<void> {
  const priority = severity === 'high' ? 'urgent' : severity === 'medium' ? 'high' : 'normal';
  
  await sendNotification(
    userId,
    NotificationType.WEATHER_ALERT,
    `Weather Alert for ${location}`,
    alert,
    { location, severity },
    priority
  );
}

// Disease warning notification
export async function sendDiseaseWarning(
  userId: string,
  crop: string,
  disease: string,
  location: string
): Promise<void> {
  await sendNotification(
    userId,
    NotificationType.DISEASE_WARNING,
    `Disease Alert: ${disease}`,
    `${disease} detected in ${crop} crops near ${location}. Take immediate action.`,
    { crop, disease, location },
    'high'
  );
}

// Treatment reminder notification
export async function sendTreatmentReminder(
  userId: string,
  treatment: string,
  dueDate: Date
): Promise<void> {
  await sendNotification(
    userId,
    NotificationType.TREATMENT_REMINDER,
    'Treatment Reminder',
    `Don't forget: ${treatment}`,
    { treatment },
    'normal',
    dueDate
  );
}

// Market update notification
export async function sendMarketUpdate(
  userId: string,
  crop: string,
  price: string,
  trend: 'up' | 'down' | 'stable'
): Promise<void> {
  const emoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  
  await sendNotification(
    userId,
    NotificationType.MARKET_UPDATE,
    `${emoji} Market Update: ${crop}`,
    `Current price: ${price} (${trend})`,
    { crop, price, trend },
    'normal'
  );
}

// System update notification
export async function sendSystemUpdate(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  await sendNotification(
    userId,
    NotificationType.SYSTEM_UPDATE,
    title,
    message,
    {},
    'low'
  );
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get notification permission status
export function getNotificationPermission(): NotificationPermission | null {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return null;
}
