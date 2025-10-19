# Coordinator/Orchestrator Agent - Complete Implementation

## Overview
The Coordinator Agent is the central orchestration system that manages all AI agents, handles task assignment, implements scheduling, and provides automation capabilities for the AgriSahayak platform.

## ✅ Features Implemented

### 1. Task Assignment Between Agents
- **Automatic Task Creation**: Creates tasks for different agents based on triggers
- **Priority-based Routing**: Routes tasks based on urgency (URGENT, HIGH, MEDIUM, LOW, SCHEDULED)
- **Intelligent Assignment**: Assigns tasks to the appropriate agent type
- **Inter-agent Communication**: Agents can trigger other agents automatically

**Example Flow:**
```
Diagnosis Complete → Treatment Plan Task → Marketplace Suggestion Task
```

### 2. Cloud Functions Triggers
Located in: `functions/src/index.ts`

#### Scheduled Functions:
- **`scheduledWeatherCheck`**: Runs every 6 hours (6 AM, 12 PM, 6 PM, 12 AM Pakistan time)
- **`processPendingTasks`**: Runs every 5 minutes to process queued tasks
- **`dailyAgentMetrics`**: Runs daily at midnight to collect performance metrics
- **`cleanupOldTasks`**: Runs weekly on Sunday at 2 AM to clean old tasks

#### Trigger Functions:
- **`onDiagnosisComplete`**: Automatically generates treatment plan after diagnosis
- **`onWeatherSignalDetected`**: Sends alerts to affected users when weather signal is detected
- **`onTreatmentPlanGenerated`**: Suggests marketplace items after treatment plan

#### HTTP Callable:
- **`createManualTask`**: Allows authenticated users to create custom tasks

### 3. Scheduled Jobs
All scheduled jobs are timezone-aware (Asia/Karachi):

| Function | Schedule | Purpose |
|----------|----------|---------|
| Weather Check | Every 6 hours | Monitor weather for all users |
| Process Tasks | Every 5 minutes | Execute pending tasks |
| Agent Metrics | Daily at midnight | Collect performance data |
| Cleanup Tasks | Weekly (Sunday 2 AM) | Remove old completed tasks |

### 4. Weather/Market Signal Automation

#### Weather Automation:
- **Proactive Monitoring**: Checks weather every 6 hours for all users
- **Geofencing**: Alerts users within 50km of weather events
- **Priority Routing**: Weather alerts are marked as URGENT priority
- **Automatic Notifications**: Sends push notifications via FCM

#### Market Signal Automation:
- **Treatment Plan Integration**: Automatically suggests suppliers after treatment plan
- **Product Extraction**: Parses treatment plans to identify required products
- **Location-based Matching**: Finds suppliers near user's location
- **Preference Handling**: Respects user's language and distance preferences

## Architecture

### Core Components

#### 1. CoordinatorAgent Class (`src/lib/coordinator-agent.ts`)
Central orchestration system with singleton pattern.

**Key Methods:**
```typescript
// Task Management
createTask(task)          // Create and queue a new task
assignTask(taskId, type)  // Assign task to specific agent
processTask(taskId)       // Execute a task
getTaskStatus(taskId)     // Get current task status
getUserTasks(userId)      // Get all tasks for a user

// Scheduling
scheduleWeatherChecks()   // Schedule weather checks for all users
processPendingTasks()     // Process all pending tasks

// Monitoring
getAgentMetrics(type?)    // Get performance metrics
logAgentDecision(...)     // Log agent actions for audit
```

#### 2. Task System

**Task States:**
```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
                                 → RETRY → IN_PROGRESS
                                 → FAILED
```

**Task Priority Levels:**
- **URGENT**: Immediate execution (weather alerts)
- **HIGH**: Within 5 minutes (diagnosis, treatment)
- **MEDIUM**: Within 1 hour (marketplace suggestions)
- **LOW**: Within 24 hours (analytics)
- **SCHEDULED**: Execute at specific time

#### 3. Agent Types
```typescript
enum AgentType {
  DIAGNOSTIC = 'diagnostic'           // Image analysis & diagnosis
  TREATMENT_PLAN = 'treatment_plan'   // Generate treatment plans
  WEATHER_ALERT = 'weather_alert'     // Weather monitoring
  MARKETPLACE = 'marketplace'         // Supplier suggestions
  IMAGE_PROCESSING = 'image_processing' // Image enhancement
}
```

### Database Schema

#### Collections:

**`agent_tasks`** - Task queue and history
```typescript
{
  id: string
  agentType: AgentType
  priority: TaskPriority
  status: TaskStatus
  userId?: string
  reportId?: string
  payload: any
  retryCount: number
  maxRetries: number
  scheduledFor?: Date
  assignedAt?: Date
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  result?: any
  createdAt: Date
  updatedAt: Date
}
```

**`agent_decisions`** - Audit log
```typescript
{
  agentName: string
  action: string
  taskId?: string
  reportId?: string
  status: 'success' | 'error' | 'retry'
  payload?: any
  duration?: number
  timestamp: Date
}
```

**`agent_metrics`** - Performance tracking
```typescript
{
  date: Timestamp
  metrics: {
    totalTasks: number
    successCount: number
    errorCount: number
    retryCount: number
    avgDuration: number
  }
  createdAt: Date
}
```

**`weather_signals`** - Weather events
```typescript
{
  type: string        // 'rain', 'storm', 'heatwave', etc.
  severity: string    // 'low', 'medium', 'high'
  lat: number
  lon: number
  radius: number      // km
  createdAt: Date
}
```

## API Endpoints

### 1. Create Task
**POST** `/api/coordinator/tasks`

```json
{
  "agentType": "diagnostic",
  "priority": "high",
  "userId": "user123",
  "reportId": "report456",
  "payload": {
    "photoDataUri": "data:image/jpeg;base64,...",
    "symptoms": "Brown spots on leaves"
  },
  "scheduledFor": "2025-10-20T10:00:00Z" // optional
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task789",
  "message": "Task created successfully"
}
```

### 2. Get Task Status
**GET** `/api/coordinator/tasks?taskId=task789`

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "task789",
    "status": "completed",
    "result": { ... },
    "createdAt": "2025-10-19T14:30:00Z",
    "completedAt": "2025-10-19T14:31:15Z"
  }
}
```

### 3. Get User Tasks
**GET** `/api/coordinator/tasks?userId=user123&limit=20`

**Response:**
```json
{
  "success": true,
  "tasks": [ ... ],
  "count": 15
}
```

### 4. Get Agent Metrics
**GET** `/api/coordinator/metrics?agentType=diagnostic`

**Response:**
```json
{
  "success": true,
  "agentType": "diagnostic",
  "metrics": {
    "totalTasks": 1250,
    "successCount": 1180,
    "errorCount": 50,
    "retryCount": 20,
    "avgDuration": 2.5
  }
}
```

### 5. Schedule Weather Checks
**POST** `/api/coordinator/schedule/weather`

**Response:**
```json
{
  "success": true,
  "message": "Weather checks scheduled successfully"
}
```

### 6. Process Pending Tasks
**POST** `/api/coordinator/process/pending`

**Response:**
```json
{
  "success": true,
  "message": "Pending tasks processed successfully"
}
```

## Integration Examples

### 1. Diagnosis with Automatic Treatment Plan
```typescript
// User submits diagnosis request
const response = await fetch('/api/diagnose', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user123',
    photoDataUri: imageData,
    symptoms: 'Yellowing leaves',
    lat: 31.5204,
    lon: 74.3587
  })
});

// Coordinator automatically:
// 1. Creates diagnostic task (HIGH priority)
// 2. Executes diagnosis
// 3. Creates treatment plan task (HIGH priority)
// 4. Generates treatment plan
// 5. Creates marketplace task (MEDIUM priority)
// 6. Suggests nearby suppliers
```

### 2. Scheduled Weather Monitoring
```typescript
// Runs automatically every 6 hours via Cloud Function
// For each user with location:
coordinator.createTask({
  agentType: AgentType.WEATHER_ALERT,
  priority: TaskPriority.SCHEDULED,
  userId: user.id,
  payload: {
    lat: user.lat,
    lon: user.lon,
    crops: user.crops
  }
});
```

### 3. Manual Task Creation
```typescript
// User-initiated marketplace search
const taskId = await coordinator.createTask({
  agentType: AgentType.MARKETPLACE,
  priority: TaskPriority.MEDIUM,
  userId: 'user123',
  payload: {
    query: 'fertilizers',
    location: { lat: 31.5204, lon: 74.3587 }
  }
});

// Check status later
const task = await coordinator.getTaskStatus(taskId);
console.log(task.status, task.result);
```

## Error Handling & Retry Logic

### Automatic Retry
- Tasks retry with exponential backoff: 1s, 2s, 4s
- Max retries: 3 (configurable per task)
- Failed tasks are logged for manual review

### Status Tracking
All state transitions are logged:
```
Processing → Retry → Processing → Complete
         ↓
       Error (after max retries)
```

## Deployment

### Firebase Functions Setup

1. **Install dependencies:**
```bash
cd functions
npm install firebase-functions firebase-admin
```

2. **Deploy functions:**
```bash
firebase deploy --only functions
```

3. **Enable required APIs:**
- Cloud Scheduler API
- Cloud Pub/Sub API
- Cloud Firestore API

### Environment Variables
Set in Firebase Console:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
```

## Monitoring & Analytics

### Agent Performance Dashboard
Access metrics via API:
```typescript
const metrics = await fetch('/api/coordinator/metrics').then(r => r.json());
```

### Metrics Tracked:
- Total tasks processed
- Success rate
- Error rate
- Retry rate
- Average execution time
- Agent-specific performance

### Audit Trail
All agent actions are logged in `agent_decisions` collection for:
- Compliance
- Debugging
- Performance analysis
- User support

## Testing

### Manual Task Creation
```bash
curl -X POST http://localhost:9002/api/coordinator/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "weather_alert",
    "priority": "high",
    "userId": "user123",
    "payload": {
      "lat": 31.5204,
      "lon": 74.3587,
      "crops": ["wheat", "rice"]
    }
  }'
```

### Check Task Status
```bash
curl http://localhost:9002/api/coordinator/tasks?taskId=task789
```

### Trigger Scheduled Jobs Manually
```bash
# Schedule weather checks
curl -X POST http://localhost:9002/api/coordinator/schedule/weather

# Process pending tasks
curl -X POST http://localhost:9002/api/coordinator/process/pending
```

## Future Enhancements

1. **Load Balancing**: Distribute tasks across multiple instances
2. **Queue Management**: Implement priority queues with Redis
3. **Real-time Monitoring**: WebSocket-based task status updates
4. **Advanced Analytics**: ML-based performance optimization
5. **Multi-region Support**: Deploy functions in multiple regions
6. **Dead Letter Queue**: Handle permanently failed tasks

## Status: ✅ FULLY IMPLEMENTED

All required features are now complete:
- ✅ Task assignment between agents
- ✅ Cloud Functions triggers
- ✅ Scheduled jobs
- ✅ Weather/market signal automation
- ✅ Error handling and retry logic
- ✅ Status tracking
- ✅ Performance monitoring
- ✅ Audit logging
