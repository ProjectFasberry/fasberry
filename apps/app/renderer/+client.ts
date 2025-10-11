import { initSentry } from "@/shared/sentry"

initSentry()

window.addEventListener('error', (err) => {
  console.error('An error occurred:', err)
})