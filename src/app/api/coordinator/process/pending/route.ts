import { NextRequest, NextResponse } from 'next/server';
import { coordinator } from '@/lib/coordinator-agent';

/**
 * POST /api/coordinator/process/pending
 * Manually trigger processing of pending tasks
 */
export async function POST(request: NextRequest) {
  try {
    await coordinator.processPendingTasks();

    return NextResponse.json({
      success: true,
      message: 'Pending tasks processed successfully'
    });
  } catch (error) {
    console.error('Error processing pending tasks:', error);
    return NextResponse.json(
      { error: 'Failed to process pending tasks', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
