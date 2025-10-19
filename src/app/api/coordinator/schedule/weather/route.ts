import { NextRequest, NextResponse } from 'next/server';
import { coordinator } from '@/lib/coordinator-agent';

/**
 * POST /api/coordinator/schedule/weather
 * Manually trigger weather check scheduling
 */
export async function POST(request: NextRequest) {
  try {
    await coordinator.scheduleWeatherChecks();

    return NextResponse.json({
      success: true,
      message: 'Weather checks scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling weather checks:', error);
    return NextResponse.json(
      { error: 'Failed to schedule weather checks', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
