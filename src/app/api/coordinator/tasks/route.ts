import { NextRequest, NextResponse } from 'next/server';
import { coordinator, AgentType, TaskPriority } from '@/lib/coordinator-agent';

/**
 * POST /api/coordinator/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentType, priority, userId, reportId, payload, scheduledFor } = body;

    if (!agentType || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: agentType, payload' },
        { status: 400 }
      );
    }

    const taskId = await coordinator.createTask({
      agentType: agentType as AgentType,
      priority: (priority as TaskPriority) || TaskPriority.MEDIUM,
      status: 'pending' as any,
      userId,
      reportId,
      payload,
      retryCount: 0,
      maxRetries: 3,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    });

    return NextResponse.json({
      success: true,
      taskId,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coordinator/tasks?userId=xxx&taskId=xxx
 * Get task status or user's tasks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (taskId) {
      // Get specific task
      const task = await coordinator.getTaskStatus(taskId);
      
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        task
      });
    } else if (userId) {
      // Get user's tasks
      const tasks = await coordinator.getUserTasks(userId, limit);
      
      return NextResponse.json({
        success: true,
        tasks,
        count: tasks.length
      });
    } else {
      return NextResponse.json(
        { error: 'Missing required parameter: taskId or userId' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error getting tasks:', error);
    return NextResponse.json(
      { error: 'Failed to get tasks', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
