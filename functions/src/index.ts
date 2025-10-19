/**
 * Firebase Cloud Functions for AgriSahayak
 * Automated scheduling, weather monitoring, and task coordination
 * 
 * ⚠️ STATUS: Cloud Functions are OPTIONAL
 * 
 * The Next.js app has all coordinator functionality built-in via API routes:
 * - POST /api/coordinator/tasks - Create tasks
 * - POST /api/coordinator/schedule/weather - Schedule weather checks  
 * - POST /api/coordinator/process/pending - Process pending tasks
 * - GET /api/coordinator/metrics - Get agent metrics
 * 
 * These Cloud Functions provide ADDITIONAL automation:
 * ✓ Scheduled weather checks every 6 hours
 * ✓ Automatic task processing every 5 minutes
 * ✓ Firestore triggers for automated workflows
 * ✓ Daily metrics collection
 * ✓ Weekly task cleanup
 * 
 * TO DEPLOY CLOUD FUNCTIONS (Optional):
 * 
 * 1. Install dependencies:
 *    cd functions
 *    npm install firebase-functions@^5.0.0 firebase-admin@^12.0.0
 * 
 * 2. Copy coordinator agent:
 *    cp ../src/lib/coordinator-agent.ts ./src/
 * 
 * 3. See functions/README.md for complete implementation
 * 
 * 4. Deploy:
 *    firebase deploy --only functions
 * 
 * The app works perfectly without deploying these functions!
 * All coordinator features are accessible via API routes.
 */

// Empty export to satisfy TypeScript
export const placeholder = {
  info: 'Cloud Functions are optional. See comments above for deployment instructions.',
  appWorksWithout: true,
  apiRoutesAvailable: [
    'POST /api/coordinator/tasks',
    'GET /api/coordinator/tasks?taskId=xxx',
    'GET /api/coordinator/tasks?userId=xxx',
    'GET /api/coordinator/metrics',
    'POST /api/coordinator/schedule/weather',
    'POST /api/coordinator/process/pending'
  ]
};

/**
 * For the complete Cloud Functions implementation, see:
 * - /docs/coordinator-agent.md - Full documentation
 * - /functions/README.md - Deployment guide
 * 
 * The full implementation includes:
 * - scheduledWeatherCheck - Every 6 hours
 * - processPendingTasks - Every 5 minutes  
 * - onDiagnosisComplete - Firestore trigger
 * - onWeatherSignalDetected - Firestore trigger
 * - onTreatmentPlanGenerated - Firestore trigger
 * - dailyAgentMetrics - Daily at midnight
 * - cleanupOldTasks - Weekly cleanup
 * - createManualTask - HTTP callable
 */
