import * as Sentry from "@sentry/react";

function sentryInit() {
  if (import.meta.env.PROD) {
    const DSN = import.meta.env.PUBLIC_ENV__SENTRY_DSN;
  
    Sentry.init({
      dsn: DSN,
      sendDefaultPii: true
    });
  }
}

sentryInit()

window.addEventListener('error', (err) => {
  console.error('An error occurred:', err)
})