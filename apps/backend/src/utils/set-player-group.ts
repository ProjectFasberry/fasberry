import { publishUpdateGroup } from "#/lib/publishers/pub-update-group";
import { luckperms } from "#/shared/database/lp-db";

export async function setPlayerGroup(nickname: string, permission: string) {
  try {
    let isUpdated: boolean = false;

    const result = await luckperms
      .insertInto("luckperms_user_permissions")
      .values((eb) => ({
        uuid: eb
          .selectFrom("luckperms_players")
          .select("uuid")
          .where("username", "=", nickname)
          .limit(1),
        permission,
        world: "global",
        expiry: 0,
        contexts: "{}",
        server: "global",
        value: true
      }))
      .onConflict((oc) =>
        oc.columns(["uuid", "permission"]).doUpdateSet({ permission })
      )
      .executeTakeFirst();

    if (!result.numInsertedOrUpdatedRows) {
      return false;
    }

    isUpdated = true

    if (!isUpdated) {
      return false;
    }

    publishUpdateGroup({ nickname, permission })

    return true;
  } catch (e) {
    console.error(e)
  }
}