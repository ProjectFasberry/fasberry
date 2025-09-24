import { refreshSession } from "#/modules/auth/auth.model";
import { Context } from "elysia";
import { CROSS_SESSION_KEY, SESSION_KEY, setCookie } from "./cookie";
import { CLIENT_ID_HEADER_KEY } from "#/modules/store/payment/create-order.route";
import { nanoid } from "nanoid";

export async function defineSession(
  token: string | null, 
  cookie: Context["cookie"]
) {
  if (!token) return;

  const refreshResult = await refreshSession(token);

  if (refreshResult) {
    const { expires_at, nickname } = refreshResult;

    setCookie({
      cookie,
      key: SESSION_KEY,
      expires: expires_at,
      value: token
    })

    setCookie({
      cookie,
      key: CROSS_SESSION_KEY,
      expires: expires_at,
      value: nickname
    })
  }
}

export function defineClientId(cookie: Context["cookie"]) {
  const existsClientId = cookie[CLIENT_ID_HEADER_KEY].value
  
  console.log(`Exists client id ${existsClientId}`)
  
  if (!existsClientId) {
    const newClientId = nanoid(7)
    const nickname = cookie["nickname"].value ?? null;
    const ip = cookie["ip"].value;

    setCookie({
      cookie,
      key: CLIENT_ID_HEADER_KEY,
      expires: new Date(9999999999999),
      value: newClientId
    });

    console.log(`Client id [ip=${ip};nickname=${nickname}] updated to ${newClientId}`);
  }
}