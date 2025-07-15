import * as Sentry from "@sentry/react";

const DSN = import.meta.env.PUBLIC_ENV__SENTRY_DSN

Sentry.init({
  dsn: DSN,
  sendDefaultPii: true
});

window.addEventListener('error', (err) => {
  console.error('An error occurred:', err)
})