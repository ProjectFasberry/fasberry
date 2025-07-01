import { MIN_SESSION_EXPIRE } from "#/modules/auth/auth.model";
import { deleteSession } from "#/modules/auth/invalidate.route";
import { auth } from "#/shared/database/auth-db";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

const getSession = async (token: string) => {
  return auth
    .selectFrom("sessions")
    .innerJoin("AUTH", "AUTH.NICKNAME", "sessions.nickname")
    .select([
      "sessions.token",
      "sessions.expires_at",
      "sessions.nickname"
    ])
    .where("sessions.token", "=", token)
    .executeTakeFirst();
}

type UpdateSessionExpire = {
  expires_at: Date,
  token: string
}

const updateSessionExpires = async ({ expires_at, token }: UpdateSessionExpire) => {
  return auth
    .updateTable("sessions")
    .set({ expires_at: expires_at })
    .where("token", "=", token)
    .execute();
}

export async function validateSessionToken(
  token: string
): Promise<{ token: string, nickname: string, expires_at: Date | string } | null> {
  const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(token))
  );

  const res = await getSession(sessionId)
  if (!res) return null

  const { expires_at, nickname } = res;

  const session: { token: string, nickname: string, expires_at: Date | string } = {
    token, nickname, expires_at
  };

  const expiresAt = new Date(session.expires_at);

  if (Date.now() >= expiresAt.getTime()) {
    const [
      res,
      //  _
    ] = await Promise.all([
      deleteSession(token), 
      // deleteSessionToken(token)
    ]);

    if (!res) {
      throw new Error("Internal Server Error");
    }

    return null;
  }

  if (Date.now() >= expiresAt.getTime() - MIN_SESSION_EXPIRE) {
    session.expires_at = new Date(Date.now() + MIN_SESSION_EXPIRE);

    await Promise.all([
      // putSessionToken(nickname, token),
      updateSessionExpires({ expires_at: session.expires_at, token })
    ]);
  }

  return session
}