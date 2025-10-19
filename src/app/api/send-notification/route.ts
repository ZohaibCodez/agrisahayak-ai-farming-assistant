import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeAdminApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeAdminApp({
    credential: require('firebase-admin/credential').cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const messaging = getMessaging();

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, data, type } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, body' },
        { status: 400 }
      );
    }

    // Get user's FCM token
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;

    if (!fcmToken) {
      return NextResponse.json(
        { error: 'User has no FCM token' },
        { status: 400 }
      );
    }

    // Create notification payload
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        type: type || 'general',
        ...data,
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#4CAF50',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    // Send notification
    const response = await messaging.send(message);

    // Log notification to Firestore
    await db.collection('notifications').add({
      userId,
      title,
      body,
      data: data || {},
      type: type || 'general',
      sentAt: new Date(),
      fcmResponse: response,
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      messageId: response,
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Send bulk notifications
export async function PUT(request: NextRequest) {
  try {
    const { userIds, title, body, data, type } = await request.json();

    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: userIds (array), title, body' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            title,
            body,
            data,
            type,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          results.push({ userId, success: true, messageId: result.messageId });
        } else {
          errors.push({ userId, error: result.error });
        }
      } catch (error) {
        errors.push({ userId, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      totalSent: results.length,
      totalErrors: errors.length,
    });

  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk notifications' },
      { status: 500 }
    );
  }
}
