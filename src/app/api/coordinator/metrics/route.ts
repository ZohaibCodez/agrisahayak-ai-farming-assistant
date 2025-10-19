import { NextRequest, NextResponse } from 'next/server';
import { coordinator, AgentType } from '@/lib/coordinator-agent';

/**
 * GET /api/coordinator/metrics?agentType=xxx
 * Get agent performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get('agentType') as AgentType | undefined;

    const metrics = await coordinator.getAgentMetrics(agentType);

    return NextResponse.json({
      success: true,
      agentType: agentType || 'all',
      metrics
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
