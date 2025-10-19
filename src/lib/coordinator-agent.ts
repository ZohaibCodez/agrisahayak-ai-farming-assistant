/**
 * Coordinator/Orchestrator Agent
 * Central coordination system for all AI agents
 * Handles task assignment, scheduling, automation, and inter-agent communication
 * 
 * SERVER-SIDE ONLY - Do not import in client components
 */

import type { Firestore } from 'firebase-admin/firestore';

// Lazy initialization to avoid importing firebase-admin on client side
let db: Firestore | null = null;

async function getDb(): Promise<Firestore> {
  if (db) return db;

  // Dynamic imports to avoid bundling in client
  const { getFirestore } = await import('firebase-admin/firestore');
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { credential } = await import('firebase-admin');

  if (!getApps().length) {
    initializeApp({
      credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      } as any),
    });
  }

  db = getFirestore();
  return db;
}

// Agent Types
export enum AgentType {
  DIAGNOSTIC = 'diagnostic',
  TREATMENT_PLAN = 'treatment_plan',
  WEATHER_ALERT = 'weather_alert',
  MARKETPLACE = 'marketplace',
  IMAGE_PROCESSING = 'image_processing'
}

// Task Status
export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry'
}

// Task Priority
export enum TaskPriority {
  URGENT = 'urgent',      // Execute immediately
  HIGH = 'high',          // Execute within 5 minutes
  MEDIUM = 'medium',      // Execute within 1 hour
  LOW = 'low',            // Execute within 24 hours
  SCHEDULED = 'scheduled' // Execute at specific time
}

// Task Interface
export interface AgentTask {
  id?: string;
  agentType: AgentType;
  priority: TaskPriority;
  status: TaskStatus;
  userId?: string;
  reportId?: string;
  payload: any;
  retryCount: number;
  maxRetries: number;
  scheduledFor?: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Coordinator Agent Class
 */
export class CoordinatorAgent {
  private static instance: CoordinatorAgent;

  private constructor() {}

  public static getInstance(): CoordinatorAgent {
    if (!CoordinatorAgent.instance) {
      CoordinatorAgent.instance = new CoordinatorAgent();
    }
    return CoordinatorAgent.instance;
  }

  /**
   * Create a new task and assign to appropriate agent
   */
  async createTask(task: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const database = await getDb();
    const now = new Date();
    const taskData = {
      ...task,
      createdAt: now,
      updatedAt: now,
      status: TaskStatus.PENDING,
      retryCount: 0,
      maxRetries: task.maxRetries || 3
    };

    const taskRef = await database.collection('agent_tasks').add(taskData);

    // Log task creation
    await this.logAgentDecision({
      agentName: 'coordinator',
      action: 'task_created',
      taskId: taskRef.id,
      status: 'success',
      payload: { agentType: task.agentType, priority: task.priority }
    });

    // If urgent or high priority, process immediately
    if (task.priority === TaskPriority.URGENT || task.priority === TaskPriority.HIGH) {
      await this.processTask(taskRef.id);
    }

    return taskRef.id;
  }

  /**
   * Assign task to specific agent
   */
  async assignTask(taskId: string, agentType: AgentType): Promise<void> {
    const database = await getDb();
    const taskRef = database.collection('agent_tasks').doc(taskId);
    const now = new Date();

    await taskRef.update({
      status: TaskStatus.ASSIGNED,
      agentType,
      assignedAt: now,
      updatedAt: now
    });

    await this.logAgentDecision({
      agentName: 'coordinator',
      action: 'task_assigned',
      taskId,
      status: 'success',
      payload: { agentType }
    });
  }

  /**
   * Process a task by routing to appropriate agent
   */
  async processTask(taskId: string): Promise<void> {
    const database = await getDb();
    const taskRef = database.collection('agent_tasks').doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      throw new Error(`Task ${taskId} not found`);
    }

    const task = { id: taskId, ...taskSnap.data() } as AgentTask;

    // Update status to in_progress
    await taskRef.update({
      status: TaskStatus.IN_PROGRESS,
      startedAt: new Date(),
      updatedAt: new Date()
    });

    try {
      let result: any = null;

      // Route to appropriate agent
      switch (task.agentType) {
        case AgentType.DIAGNOSTIC:
          result = await this.executeDiagnosticAgent(task);
          break;
        case AgentType.TREATMENT_PLAN:
          result = await this.executeTreatmentPlanAgent(task);
          break;
        case AgentType.WEATHER_ALERT:
          result = await this.executeWeatherAlertAgent(task);
          break;
        case AgentType.MARKETPLACE:
          result = await this.executeMarketplaceAgent(task);
          break;
        case AgentType.IMAGE_PROCESSING:
          result = await this.executeImageProcessingAgent(task);
          break;
        default:
          throw new Error(`Unknown agent type: ${task.agentType}`);
      }

      // Mark task as completed
      await taskRef.update({
        status: TaskStatus.COMPLETED,
        result,
        completedAt: new Date(),
        updatedAt: new Date()
      });

      await this.logAgentDecision({
        agentName: task.agentType,
        action: 'task_completed',
        taskId,
        status: 'success',
        payload: { result }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if should retry
      if (task.retryCount < task.maxRetries) {
        await taskRef.update({
          status: TaskStatus.RETRY,
          retryCount: task.retryCount + 1,
          errorMessage,
          updatedAt: new Date()
        });

        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, task.retryCount) * 1000; // 1s, 2s, 4s, etc.
        setTimeout(() => this.processTask(taskId), retryDelay);

        await this.logAgentDecision({
          agentName: task.agentType,
          action: 'task_retry',
          taskId,
          status: 'retry',
          payload: { error: errorMessage, retryCount: task.retryCount + 1 }
        });
      } else {
        // Max retries reached, mark as failed
        await taskRef.update({
          status: TaskStatus.FAILED,
          errorMessage,
          completedAt: new Date(),
          updatedAt: new Date()
        });

        await this.logAgentDecision({
          agentName: task.agentType,
          action: 'task_failed',
          taskId,
          status: 'error',
          payload: { error: errorMessage }
        });
      }
    }
  }

  /**
   * Execute Diagnostic Agent
   */
  private async executeDiagnosticAgent(task: AgentTask): Promise<any> {
    // Dynamic import to avoid circular dependencies
    const { instantDiagnosisFromImageAndSymptoms } = await import('@/ai/flows/instant-diagnosis-from-image-and-symptoms');
    
    const result = await instantDiagnosisFromImageAndSymptoms({
      photoDataUri: task.payload.photoDataUri,
      symptoms: task.payload.symptoms || ''
    });

    // Update report if reportId exists
    if (task.reportId && task.userId) {
      const database = await getDb();
      await database.collection('users').doc(task.userId).collection('reports').doc(task.reportId).update({
        disease: result.disease,
        confidence: result.confidence,
        affectedParts: result.affectedParts,
        severity: result.severity,
        description: result.description,
        crop: result.crop,
        status: 'Complete',
        updatedAt: new Date()
      });
    }

    return result;
  }

  /**
   * Execute Treatment Plan Agent
   */
  private async executeTreatmentPlanAgent(task: AgentTask): Promise<any> {
    const { generateLocalizedTreatmentPlan } = await import('@/ai/flows/localized-treatment-plans');
    
    const result = await generateLocalizedTreatmentPlan({
      disease: task.payload.disease,
      crop: task.payload.crop || 'Unknown'
    });

    // Update report with treatment plan
    if (task.reportId && task.userId) {
      const database = await getDb();
      await database.collection('users').doc(task.userId).collection('reports').doc(task.reportId).update({
        plan: result,
        updatedAt: new Date()
      });
    }

    return result;
  }

  /**
   * Execute Weather Alert Agent
   */
  private async executeWeatherAlertAgent(task: AgentTask): Promise<any> {
    const { proactiveWeatherAlertsWithRecommendations } = await import('@/ai/flows/proactive-weather-alerts-with-recommendations');
    
    const result = await proactiveWeatherAlertsWithRecommendations({
      location: `${task.payload.lat},${task.payload.lon}`,
      crops: task.payload.crops || [],
      weatherConditions: task.payload.weatherType || 'current weather'
    });

    // Send notifications to user
    if (task.userId && result.alert) {
      await this.sendWeatherNotifications(task.userId, [result]);
    }

    return result;
  }

  /**
   * Execute Marketplace Agent
   */
  private async executeMarketplaceAgent(task: AgentTask): Promise<any> {
    const { marketplaceAgent } = await import('@/ai/flows/marketplace-agent');
    
    const result = await marketplaceAgent({
      query: task.payload.query,
      location: task.payload.location,
      filters: task.payload.filters
    });

    return result;
  }

  /**
   * Execute Image Processing Agent
   */
  private async executeImageProcessingAgent(task: AgentTask): Promise<any> {
    const { imageProcessingAgent } = await import('@/ai/flows/image-processing-agent');
    
    const result = await imageProcessingAgent({
      imageData: task.payload.imageData || task.payload.photoDataUri,
      location: task.payload.location,
      farmerText: task.payload.farmerText
    });

    return result;
  }

  /**
   * Schedule recurring weather checks for all users
   */
  async scheduleWeatherChecks(): Promise<void> {
    const database = await getDb();
    const usersSnap = await database.collection('profiles').get();

    for (const userDoc of usersSnap.docs) {
      const profile = userDoc.data();
      
      if (profile.lat && profile.lon) {
        await this.createTask({
          agentType: AgentType.WEATHER_ALERT,
          priority: TaskPriority.SCHEDULED,
          status: TaskStatus.PENDING,
          userId: userDoc.id,
          payload: {
            lat: profile.lat,
            lon: profile.lon,
            crops: profile.crops || []
          },
          retryCount: 0,
          maxRetries: 2,
          scheduledFor: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
        });
      }
    }

    await this.logAgentDecision({
      agentName: 'coordinator',
      action: 'weather_checks_scheduled',
      status: 'success',
      payload: { userCount: usersSnap.size }
    });
  }

  /**
   * Process pending tasks (to be called by scheduler)
   */
  async processPendingTasks(): Promise<void> {
    const database = await getDb();
    const now = new Date();
    
    const pendingTasksSnap = await database.collection('agent_tasks')
      .where('status', 'in', [TaskStatus.PENDING, TaskStatus.ASSIGNED])
      .where('scheduledFor', '<=', now)
      .limit(10)
      .get();

    const processingPromises = pendingTasksSnap.docs.map(doc => 
      this.processTask(doc.id).catch(err => 
        console.error(`Error processing task ${doc.id}:`, err)
      )
    );

    await Promise.all(processingPromises);
  }

  /**
   * Send weather notifications to user
   */
  private async sendWeatherNotifications(userId: string, alerts: any[]): Promise<void> {
    const database = await getDb();
    const notificationsRef = database.collection('users').doc(userId).collection('notifications');

    for (const alert of alerts) {
      await notificationsRef.add({
        type: 'weather_alert',
        title: alert.title || 'Weather Alert',
        message: alert.message || alert.alert,
        severity: alert.severity || 'medium',
        read: false,
        createdAt: new Date()
      });
    }

    // Trigger push notification if FCM token exists
    const profileSnap = await database.collection('profiles').doc(userId).get();
    const profile = profileSnap.data();

    if (profile?.fcmToken) {
      // Send FCM notification (implementation depends on your FCM setup)
      await this.sendFCMNotification(profile.fcmToken, alerts[0]);
    }
  }

  /**
   * Send FCM push notification
   */
  private async sendFCMNotification(token: string, alert: any): Promise<void> {
    try {
      // This would use Firebase Admin SDK messaging
      // For now, just log it
      console.log('Sending FCM notification:', { token, alert });
    } catch (error) {
      console.error('Error sending FCM notification:', error);
    }
  }

  /**
   * Log agent decision for auditability
   */
  async logAgentDecision(decision: {
    agentName: string;
    action: string;
    taskId?: string;
    reportId?: string;
    status: 'success' | 'error' | 'retry';
    payload?: any;
    duration?: number;
  }): Promise<void> {
    const database = await getDb();
    await database.collection('agent_decisions').add({
      ...decision,
      timestamp: new Date()
    });
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<AgentTask | null> {
    const database = await getDb();
    const taskSnap = await database.collection('agent_tasks').doc(taskId).get();
    return taskSnap.exists ? { id: taskId, ...taskSnap.data() } as AgentTask : null;
  }

  /**
   * Get user's tasks
   */
  async getUserTasks(userId: string, limit: number = 20): Promise<AgentTask[]> {
    const database = await getDb();
    const tasksSnap = await database.collection('agent_tasks')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgentTask));
  }

  /**
   * Monitor agent performance
   */
  async getAgentMetrics(agentType?: AgentType): Promise<any> {
    const database = await getDb();
    let query = database.collection('agent_decisions');

    if (agentType) {
      query = query.where('agentName', '==', agentType) as any;
    }

    const decisionsSnap = await query.limit(1000).get();
    
    const metrics = {
      totalTasks: decisionsSnap.size,
      successCount: 0,
      errorCount: 0,
      retryCount: 0,
      avgDuration: 0
    };

    decisionsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'success') metrics.successCount++;
      if (data.status === 'error') metrics.errorCount++;
      if (data.status === 'retry') metrics.retryCount++;
      if (data.duration) metrics.avgDuration += data.duration;
    });

    metrics.avgDuration = metrics.avgDuration / decisionsSnap.size;

    return metrics;
  }
}

// Export singleton instance
export const coordinator = CoordinatorAgent.getInstance();
