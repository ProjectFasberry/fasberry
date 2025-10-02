import { getNatsConnection } from "#/shared/nats/client"
// import { USER_NOTIFICATIONS_SUBJECT } from "#/shared/nats/nats-subjects"

export function publishVoteNotify(nickname: string) {
  const nc = getNatsConnection()

  const payload = JSON.stringify({
    type: "vote",
    payload: { nickname }
  })

  // todo: replace to real subject
  return nc.publish("test", payload)
}