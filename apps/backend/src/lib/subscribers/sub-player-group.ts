import { getNatsConnection } from "#/shared/nats/nats-client"
import { LUCKPERMS_UPDATE_SUBJECT } from "#/shared/nats/nats-subjects"
import { natsLogger } from "@repo/lib/logger"

type LuckpermsUpdateContent = {
  userUuid: string
}

export type LuckpermsLogContent = {
  timestamp: number,
  source: {
    uniqueId: string,
    name: string
  },
  target: {
    type: "USER" | "GROUP",
    uniqueId: string,
    name: string
  },
  description: string
}

type LuckpermsUpdatePayload = {
  id: string,
} & (
    | { type: "userupdate", content: LuckpermsUpdateContent }
    | { type: "log", content: LuckpermsLogContent }
  )

type ActionType = "set" | "unset"

// export const subscribePlayerGroup = () => {
//   const nc = getNatsConnection()

//   natsLogger.success("Subscribed to player group")

//   return nc.subscribe(LUCKPERMS_UPDATE_SUBJECT, {
//     callback: async (e, msg) => {
//       if (e) {
//         console.error(e)
//         return;
//       }

//       setImmediate(async () => {
//         try {
//           const data: string = new TextDecoder().decode(msg.data)
//             .replace(/^[\x00-\x1F\x7F]+/, "")
//             .trim()
//             .replace(/^[^\{]+/, "");

//           if (!data.startsWith("{")) {
//             throw new Error("Некорректный JSON: отсутствует '{' в начале строки");
//           }

//           const { type, content } = JSON.parse(data) as LuckpermsUpdatePayload;
          
//           if (type === "log" && content.description.includes("group.")) {
//             const args = content.description.split(" ");
//             // set permission -> permission set group.arkhont true -> ["permission", "set", "group.arkhont", "true"]
//             // unset permission -> permission unset group.arkhont -> ["permission", "unset", "group.arkhont"]

//             const action = args[1] as ActionType;
//             const initiator = content.source.name;
//             const recipient = content.target.name;

//             console.log(`${action}: ${recipient}`)

//             switch (action) {
//               case "set":
//                 const group = args[2]?.split(" ")[0];
//                 const donate = group.split(".")[1] as DonateVariants;

//                 const updatedRes = await updateUserDonateForum({
//                   nickname: recipient, donate
//                 });

//                 if (!updatedRes) {
//                   console.log(`Failed to update user donate: ${recipient} / group: ${group} / ${initiator}`)

//                   // await createErrorLog({
//                   //   description: `Failed to update user donate: ${recipient} 
//                   //     / group: ${group} 
//                   //     / ${initiator}`,
//                   //   initiator,
//                   //   type: "update_user_donate_forum",
//                   //   recipient
//                   // })
//                 }

//                 console.log(`[Forum] Updated for ${recipient} / group: ${group} / donate: ${updatedRes}`)

//                 break;
//               case "unset":
//                 // default = without donate
//                 let currentPermission: DonateVariants = "default";

//                 // const query = await lpDB
//                 //   .selectFrom("luckperms_user_permissions")
//                 //   .select(["permission"])
//                 //   .where("uuid", "=", content.target.uniqueId)
//                 //   .where("permission", "like", "group.%")
//                 //   .execute()

//                 // if (query) {
//                 //   query.forEach(({ permission }) => {
//                 //     const group = permission.split(" ")[0];

//                 //     currentPermission = group.split(".")[1] as DonateVariants;
//                 //   })
//                 // }

//                 const res = await updateUserDonateForum({
//                   nickname: recipient,
//                   donate: "default",
//                 });

//                 if (!res) {
//                   console.log(`Failed to update user donate: ${recipient} 
//                     / group: ${currentPermission.split(".")[1]} / ${initiator}`)

//                   // await createErrorLog({
//                   //   description: `Failed to update user donate: ${recipient} 
//                   //     / group: ${currentPermission.split(".")[1]} 
//                   //     / ${initiator}`,
//                   //   initiator,
//                   //   type: "update_user_donate_forum",
//                   //   recipient
//                   // })
//                 }

//                 console.log(`[Forum] Updated for ${recipient} 
//                   / group: ${currentPermission.split(".")[1]} / donate: ${res}`)

//                 break;
//             }

//             createUserActionLog(content);
//           }
//         } catch (err) {
//           console.error(err);
//         }
//       });
//     }
//   })
// }