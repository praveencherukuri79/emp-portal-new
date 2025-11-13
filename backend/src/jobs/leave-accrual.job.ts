/**
 * Leave Accrual Scheduled Jobs
 * Runs monthly accrual and annual reset
 */

import cron from 'node-cron';
import { LeaveAccrualService } from '../services/leave-accrual.service';

/**
 * Monthly leave accrual job
 * Runs on 1st of every month at 00:00
 */
export const monthlyAccrualJob = cron.schedule('0 0 1 * *', async () => {
  console.log(`\n📅 [${new Date().toISOString()}] Running monthly leave accrual job...`);
  
  try {
    const results = await LeaveAccrualService.runMonthlyAccrual();
    console.log(`✅ Monthly accrual completed: ${results.success} succeeded, ${results.failed} failed`);
    
    if (results.errors.length > 0) {
      console.error('Errors:', results.errors);
    }
  } catch (error) {
    console.error('❌ Monthly accrual job failed:', error);
  }
});

/**
 * Annual leave reset job
 * Runs on January 1st at 00:00
 */
export const annualResetJob = cron.schedule('0 0 1 1 *', async () => {
  console.log(`\n📅 [${new Date().toISOString()}] Running annual leave reset job...`);
  
  try {
    const results = await LeaveAccrualService.runAnnualReset();
    console.log(`✅ Annual reset completed: ${results.success} succeeded, ${results.failed} failed`);
  } catch (error) {
    console.error('❌ Annual reset job failed:', error);
  }
});

/**
 * Start all leave accrual jobs
 */
export function startLeaveAccrualJobs(): void {
  console.log('📅 Starting leave accrual scheduled jobs...');
  monthlyAccrualJob.start();
  annualResetJob.start();
  console.log('✅ Leave accrual jobs started');
  console.log('  - Monthly accrual: 1st of every month at 00:00');
  console.log('  - Annual reset: January 1st at 00:00');
}

/**
 * Stop all leave accrual jobs
 */
export function stopLeaveAccrualJobs(): void {
  monthlyAccrualJob.stop();
  annualResetJob.stop();
  console.log('⏸️  Leave accrual jobs stopped');
}

