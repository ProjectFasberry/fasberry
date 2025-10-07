import { logger } from '../config/logger';
import { updateExchangeRates } from '#/modules/store/payment/currencies.model';
import { Cron, CronOptions } from "croner";
import { cleanOldEvents } from '#/modules/server/events/events.model';
import { updateServerStatus } from '#/modules/server/status.route';

type Job = {
  name: string;
  cron: string;
  callback: () => Promise<void>;
  immediately: boolean;
  schedule: boolean;
}

const cronLogger = logger.withTag("Cron")

async function wrapJobCb(name: string, cb: () => Promise<void>) {
  try {
    await cb()
    cronLogger.log(`Finished job "${name}"`);
  } catch (e) {
    cronLogger.error(`Error in job "${name}"`, e);
  }
}

const JOBS: Job[] = [
  {
    name: "update-exchange-rates",
    cron: "0 */10 * * * *",
    callback: async function () {
      await wrapJobCb(this.name, updateExchangeRates)
    },
    immediately: true,
    schedule: true
  },
  {
    name: "warn-before-update-exchange-rates",
    cron: "0 5-59/10 * * * *",
    callback: async function () {
      cronLogger.log(`"${this.name}" job will be started in 5 minutes`);
    },
    immediately: true,
    schedule: true
  },
  {
    name: "clean-old-events",
    cron: "0 */10 * * * *",
    callback: async function () {
      await wrapJobCb(this.name, cleanOldEvents)
    },
    immediately: true,
    schedule: true
  },
  {
    name: "warn-before-clean-old-events",
    cron: "0 5-59/10 * * * *",
    callback: async function () {
      cronLogger.log(`"${this.name}" job will be started in 5 minutes`);
    },
    immediately: true,
    schedule: true
  },
  {
    name: "update-server-status",
    cron: "* * * * *",
    callback: async function () {
      await wrapJobCb(this.name, updateServerStatus)
    },
    immediately: false,
    schedule: false
  }
]

export function startJobs() {
  const immediatelyJobs: Array<() => void> = [];

  for (const job of JOBS) {
    let config: CronOptions = {}

    if (job.schedule) {
      const temp = new Cron(job.cron);
      const nextRun = temp.nextRun();

      if (!nextRun) continue;

      const delayedStart = new Date(nextRun.getTime() + 5 * 60 * 1000);

      config = {
        startAt: delayedStart,
      }
    }

    const cronJob = new Cron(
      job.cron,
      config,
      async () => await job.callback()
    );

    cronLogger.log(
      `Job "${job.name}" will be started at ${cronJob.nextRun()?.toISOString()}`
    );
  }

  immediatelyJobs.forEach(fn => fn())
}