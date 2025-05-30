const cron = require('node-cron');
const { 
  startCronJobs, 
  stopCronJobs, 
  getCronJobStatus,
  dailySummaryJob,
  weeklySummaryJob 
} = require('./dailySummary');

class CronManager {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  // Initialize cron manager
  init() {
    if (this.isInitialized) {
      console.log('Cron manager already initialized');
      return;
    }

    // Register default jobs
    this.jobs.set('dailySummary', dailySummaryJob);
    this.jobs.set('weeklySummary', weeklySummaryJob);

    this.isInitialized = true;
    console.log('✅ Cron manager initialized');
  }

  // Start all cron jobs
  startAll() {
    if (!this.isInitialized) {
      this.init();
    }

    startCronJobs();
    console.log('🚀 All cron jobs started');
  }

  // Stop all cron jobs
  stopAll() {
    stopCronJobs();
    console.log('🛑 All cron jobs stopped');
  }

  // Get status of all jobs
  getStatus() {
    return getCronJobStatus();
  }

  // Start specific job
  startJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      console.log(`✅ Started job: ${jobName}`);
      return true;
    } else {
      console.log(`❌ Job not found: ${jobName}`);
      return false;
    }
  }

  // Stop specific job
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`🛑 Stopped job: ${jobName}`);
      return true;
    } else {
      console.log(`❌ Job not found: ${jobName}`);
      return false;
    }
  }

  // Add custom cron job
  addJob(name, schedule, task, options = {}) {
    try {
      const job = cron.schedule(schedule, task, {
        scheduled: false,
        timezone: options.timezone || "America/New_York",
        ...options
      });

      this.jobs.set(name, job);
      console.log(`✅ Added custom job: ${name} with schedule: ${schedule}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add job ${name}:`, error.message);
      return false;
    }
  }

  // Remove custom job
  removeJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      job.destroy();
      this.jobs.delete(name);
      console.log(`🗑️ Removed job: ${name}`);
      return true;
    } else {
      console.log(`❌ Job not found: ${name}`);
      return false;
    }
  }

  // List all jobs
  listJobs() {
    const jobList = [];
    for (const [name, job] of this.jobs.entries()) {
      jobList.push({
        name,
        running: job.running || false,
        scheduled: job.scheduled || false
      });
    }
    return jobList;
  }

  // Validate cron expression
  validateCronExpression(expression) {
    return cron.validate(expression);
  }

  // Get next execution times for a job
  getNextExecutions(jobName, count = 5) {
    const job = this.jobs.get(jobName);
    if (!job) {
      return null;
    }

    // This is a simplified implementation
    // In a real scenario, you might want to use a library like 'cron-parser'
    try {
      const executions = [];
      // Add logic to calculate next execution times
      return executions;
    } catch (error) {
      console.error(`Error calculating next executions for ${jobName}:`, error.message);
      return null;
    }
  }

  // Emergency stop all jobs
  emergencyStop() {
    console.log('🚨 Emergency stop initiated - stopping all cron jobs');
    for (const [name, job] of this.jobs.entries()) {
      try {
        job.stop();
        console.log(`🛑 Emergency stopped: ${name}`);
      } catch (error) {
        console.error(`❌ Failed to emergency stop ${name}:`, error.message);
      }
    }
  }

  // Health check for cron jobs
  healthCheck() {
    const status = this.getStatus();
    const health = {
      overall: 'healthy',
      jobs: {},
      timestamp: new Date().toISOString()
    };

    let hasUnhealthyJobs = false;

    for (const [jobName, jobStatus] of Object.entries(status)) {
      if (jobStatus.running) {
        health.jobs[jobName] = 'running';
      } else {
        health.jobs[jobName] = 'stopped';
        hasUnhealthyJobs = true;
      }
    }

    if (hasUnhealthyJobs) {
      health.overall = 'degraded';
    }

    return health;
  }

  // Get detailed job information
  getJobInfo(jobName) {
    const job = this.jobs.get(jobName);
    if (!job) {
      return null;
    }

    const status = this.getStatus();
    const jobStatus = status[jobName];

    return {
      name: jobName,
      running: job.running || false,
      scheduled: job.scheduled || false,
      schedule: jobStatus?.schedule || 'unknown',
      description: jobStatus?.description || 'No description available',
      lastRun: null, // Would need to track this separately
      nextRun: null   // Would need to calculate this
    };
  }
}

// Create singleton instance
const cronManager = new CronManager();

// Export both the class and the singleton instance
module.exports = {
  CronManager,
  cronManager
};
