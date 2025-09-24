import { isProduction, SENTRY_PUBLIC_DSN } from "@/shared/env";
import * as Sentry from "@sentry/react";

const sentryConfig: Sentry.BrowserOptions = {
  dsn: SENTRY_PUBLIC_DSN,
  sendDefaultPii: true
}

function initSentry() {
  if (isProduction) {  
    Sentry.init(sentryConfig);
  }
}

initSentry()

window.addEventListener('error', (err) => {
  console.error('An error occurred:', err)
})