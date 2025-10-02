import { createLoggerFactory, DEFAULT_LOGGER_LEVELS } from '@neodx/log';
import { pretty, json } from '@neodx/log/node';
import { printf, readArguments } from '@neodx/log/utils';

export const createLogger = createLoggerFactory({
  defaultParams: {
    levels: {
      ...DEFAULT_LOGGER_LEVELS,
      details: 50, 
      debug: 60 
    },
    level: 'details', 
    name: 'fasberry',
    transform: [],
    target: [
      process.env.NODE_ENV === 'production'
        ? json() // stream JSON logs to stdout
        : // show pretty formatted logs in console
        pretty({
          displayMs: true,
          levelColors: {
            ...pretty.defaultColors,
            details: 'magenta' 
          },
          levelBadges: {
            ...pretty.defaultBadges,
            details: '🤪' 
          }
        })
    ],
    meta: {
      pid: process.pid
    }
  },
  readArguments,
  formatMessage: printf
});

export const logger = createLogger();