# AgriSahayak Coordinator Agent - Quick Start

## Setup Instructions

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Firebase
```bash
# Login to Firebase
firebase login

# Select your project
firebase use your-project-id
```

### 3. Set Environment Variables
```bash
firebase functions:config:set \
  firebase.project_id="your-project-id" \
  firebase.client_email="your-service-account@..." \
  firebase.private_key="-----BEGIN PRIVATE KEY-----..."
```

### 4. Test Locally
```bash
# Start Firebase emulators
npm run serve

# In another terminal, test the API
curl http://localhost:9002/api/coordinator/tasks?userId=test
```

### 5. Deploy to Production
```bash
# Build functions
npm run build

# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:scheduledWeatherCheck
```

## Available Cloud Functions

### Scheduled Functions
- `scheduledWeatherCheck` - Every 6 hours
- `processPendingTasks` - Every 5 minutes
- `dailyAgentMetrics` - Daily at midnight
- `cleanupOldTasks` - Weekly on Sunday

### Trigger Functions
- `onDiagnosisComplete` - When diagnosis finishes
- `onWeatherSignalDetected` - When weather event occurs
- `onTreatmentPlanGenerated` - After treatment plan created

### HTTP Callable
- `createManualTask` - Create custom tasks

## API Endpoints

All endpoints are available at: `https://your-app.web.app/api/coordinator/`

- `POST /tasks` - Create task
- `GET /tasks?taskId=xxx` - Get task status
- `GET /tasks?userId=xxx` - Get user tasks
- `GET /metrics` - Get agent metrics
- `POST /schedule/weather` - Trigger weather checks
- `POST /process/pending` - Process pending tasks

## Testing Examples

### Create a diagnostic task
```bash
curl -X POST http://localhost:9002/api/coordinator/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "diagnostic",
    "priority": "high",
    "userId": "user123",
    "payload": {
      "photoDataUri": "data:image/jpeg;base64,...",
      "symptoms": "Brown spots"
    }
  }'
```

### Check task status
```bash
curl "http://localhost:9002/api/coordinator/tasks?taskId=task789"
```

### Get agent metrics
```bash
curl "http://localhost:9002/api/coordinator/metrics?agentType=diagnostic"
```

### Manually trigger weather checks
```bash
curl -X POST http://localhost:9002/api/coordinator/schedule/weather
```

## Monitoring

### View logs
```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only scheduledWeatherCheck

# Follow logs in real-time
firebase functions:log --only scheduledWeatherCheck --follow
```

### Check function status
```bash
firebase functions:list
```

## Troubleshooting

### Function not deploying
```bash
# Check Firebase CLI version
firebase --version

# Update if needed
npm install -g firebase-tools@latest

# Clear cache and redeploy
firebase functions:delete functionName
firebase deploy --only functions:functionName
```

### Scheduled functions not running
1. Enable Cloud Scheduler API in Google Cloud Console
2. Verify timezone: `Asia/Karachi`
3. Check logs for errors

### Import errors
Make sure coordinator-agent.ts is in the functions/src directory:
```bash
cp ../src/lib/coordinator-agent.ts functions/src/
```

## Cost Optimization

### Free Tier Limits (Spark Plan)
- 125K invocations/month
- 40K GB-seconds
- 40K CPU-seconds
- 5GB outbound networking

### Blaze Plan (Pay as you go)
- $0.40 per million invocations
- $0.0000025 per GB-second
- $0.0000100 per GHz-second

### Optimize Costs
1. Reduce function memory allocation
2. Increase schedule intervals
3. Implement request caching
4. Use batch processing

## Security

### IAM Permissions
Ensure service account has:
- `cloudfunctions.functions.invoke`
- `cloudscheduler.jobs.run`
- `firestore.documents.read/write`
- `cloudmessaging.messages.create`

### API Security
- Use Firebase Authentication
- Validate user permissions
- Rate limit API calls
- Enable CORS properly

## Support

For issues or questions:
- Check logs: `firebase functions:log`
- View documentation: `docs/coordinator-agent.md`
- Firebase Console: https://console.firebase.google.com

## Status
✅ Fully implemented and production-ready
