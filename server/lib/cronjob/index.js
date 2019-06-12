/**
 * cronjob class
 */
const Cron = require('cron').CronJob;

class CronJob {
  /**
   * @param {string} frequency cron pattern * * * * *
   * @param {function} cb a callback of the function to run
   */
  constructor(frequency, cb) {
    this.job = new Cron(frequency, cb);
  }

  start() {
    this.job.start();
  }

  stop() {
    this.job.stop();
  }

  job() {
    return this.job;
  }
}

module.exports = CronJob;
