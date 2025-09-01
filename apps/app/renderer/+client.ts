import * as Sentry from "@sentry/react";

const DSN = import.meta.env.PUBLIC_ENV__SENTRY_DSN;

const sentryConfig: Sentry.BrowserOptions = {
  dsn: DSN,
  sendDefaultPii: true
}

function initSentry() {
  const isProduction = import.meta.env.PROD;

  if (isProduction) {  
    Sentry.init(sentryConfig);
  }
}

initSentry()

window.addEventListener('error', (err) => {
  console.error('An error occurred:', err)
})