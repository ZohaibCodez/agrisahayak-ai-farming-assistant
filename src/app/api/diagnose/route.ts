import { NextRequest, NextResponse } from 'next/server';
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

import { instantDiagnosisFromImageAndSymptoms } from '@/ai/flows/instant-diagnosis-from-image-and-symptoms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, photoDataUri, symptoms, lat, lon } = body || {};

    if (!userId || !photoDataUri) {
      return NextResponse.json({ error: 'Missing userId or photoDataUri' }, { status: 400 });
    }

    // Create a Processing report entry
    const reportsRef = db.collection('users').doc(userId).collection('reports');
    const createdAt = new Date();
    const reportDocRef = await reportsRef.add({
      uid: userId,
      crop: null,
      imageThumb: null,
      symptoms: symptoms ?? null,
      imageUrl: null,
      disease: 'Processing',
      confidence: 0,
      affectedParts: [],
      severity: 'Low',
      description: '',
      plan: null,
      status: 'Processing',
      createdAt,
      updatedAt: createdAt,
      location: lat && lon ? { lat, lon } : null,
    });

    const reportId = reportDocRef.id;

    // Call the diagnostic flow (server-side GenKit flow)
    let diagnosisResult: any = null;
    try {
      diagnosisResult = await instantDiagnosisFromImageAndSymptoms({ photoDataUri, symptoms: symptoms ?? '' });

      // Update report with diagnosis
      await reportDocRef.update({
        disease: diagnosisResult.disease ?? 'Unknown',
        confidence: diagnosisResult.confidence ?? 0,
        affectedParts: diagnosisResult.affectedParts ?? [],
        severity: diagnosisResult.severity ?? 'Low',
        description: diagnosisResult.description ?? '',
        crop: diagnosisResult.crop ?? null,
        status: 'Complete',
        updatedAt: new Date(),
      } as any);

      // Log agent decision for auditability
      await db.collection('agent_decisions').add({
        agentName: 'diagnosticAgent',
        action: 'diagnosis_completed',
        reportId,
        status: 'success',
        payload: diagnosisResult,
        duration: null,
        timestamp: new Date(),
      });

      return NextResponse.json({ success: true, reportId, diagnosis: diagnosisResult });
    } catch (err) {
      console.error('Diagnosis flow error:', err);
      await reportDocRef.update({ status: 'Error', updatedAt: new Date(), description: `Diagnosis failed: ${err instanceof Error ? err.message : String(err)}` } as any);
      await db.collection('agent_decisions').add({
        agentName: 'diagnosticAgent',
        action: 'diagnosis_failed',
        reportId,
        status: 'error',
        payload: { error: err instanceof Error ? err.message : String(err) },
        duration: null,
        timestamp: new Date(),
      });

      return NextResponse.json({ error: 'Diagnosis failed' }, { status: 500 });
    }

  } catch (error) {
    console.error('Orchestrator error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
