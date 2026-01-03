import { initPlayerSkin, updatePlayersSkins } from "#/modules/server/skin/skin.model";
import { type Bot, format, type MessageContext } from "gramio";
import { botLogger, getGuardBot } from ".";
import { getServerStatus } from "#/modules/server/status/status.model";
import { type CommandCtx, GUARD_COMMANDS } from "./cmds";
import { Keyboard } from "gramio";
import { getRcon } from "../rcon/init";
import { getChats, revalidateChats } from "../constants/chats";
import { getUrls, revalidateUrls } from "../constants/urls";
import { wrapError } from "#/helpers/wrap-error";

export async function botInfoCmdCb(ctx: CommandCtx) {
  const cmds = Array.from(GUARD_COMMANDS.entries()).map(([cmd, pd]) => `${cmd}: ${pd.type}`).join(", ")

  const text = format`
    loaded=${cmds}
  `

  ctx.send(text)
  ctx.delete({ message_id: ctx.id })
}

export async function backendInfoCmdCb(ctx: CommandCtx) {
  const urls = Object.entries(getUrls()).map(([k, v]) => `${k}: ${v}`).join(", ")
  const chats = getChats().join(", ")

  const text = format`
    chats=${chats}
    urls=${urls}
  `

  ctx.send(text)
  ctx.delete({ message_id: ctx.id })
}

export async function revalidateChatsCmdCb(ctx: CommandCtx) {
  const result = await revalidateChats()

  if (!result.ok) {
    ctx.reply(`chats is not revalidated. Error: ${wrapError(result.error).error}`)
    return;
  }

  const msg = `chats revalidated, prev=${result.data.prev}, loaded=${result.data.upd}`
  
  ctx.send(msg)
  ctx.delete({ message_id: ctx.id })
}

export async function revalidateUrlsCmdCb(ctx: CommandCtx) {
  const result = await revalidateUrls()

  if (!result.ok) {
    ctx.reply(`urls is not revalidated. Error: ${wrapError(result.error).error}`)
    return;
  }

  const msg = `urls revalidated, prev=${result.data.prev}, loaded=${result.data.upd}`

  ctx.send(msg)
  ctx.delete({ message_id: ctx.id })
}

export async function updateSkinCmdCb(ctx: CommandCtx) {
  const parts = ctx.args?.split(/\s+/) ?? [];

  let targetPlayer: string | null = null;

  if (parts && parts.length >= 1) {
    targetPlayer = parts[0]
  }

  type EventResult = boolean | Map<string, boolean>;

  const opts = { batchSize: 1000, conc: 100 }

  const eventFn: () => Promise<EventResult> = targetPlayer
    ? () => initPlayerSkin(targetPlayer)
    : () => updatePlayersSkins(opts.conc, opts.batchSize)

  const message = targetPlayer
    ? `start updating player ${targetPlayer}`
    : `start updating players. args: ${Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(", ")}`

  async function startEvent<T>(
    ctx: MessageContext<Bot>,
    chat_id: string,
    fn: () => Promise<T>,
    startMsg: string,
    finishMsg: (payload: T) => string
  ) {
    try {
      await ctx.send(startMsg)

      const fnResult = await fn()

      const bot = getGuardBot();
      bot.api.sendMessage({ chat_id, text: finishMsg(fnResult) })
    } catch (e) {
      botLogger.error(e)
    }
  }

  startEvent(
    ctx,
    ctx.chat.id.toString(),
    eventFn,
    message,
    (payload) => `result= 
      ${payload instanceof Map ? JSON.stringify(Array.from(payload.values())) : payload}
    `
  )
}

export async function statusCmdCb(ctx: CommandCtx) {
  async function get() {
    const status = await getServerStatus()

    const proxyText = status?.proxy
      ? `${status?.proxy.online + "/" + status?.proxy.max}`
      : "n/a";

    const servers = status?.servers ? Object.entries(status.servers) : []

    const serversText = servers.length
      ? servers.map(([s, v]) => `${s}:${v.online}/${v.max}`).join("\n")
      : "n/a"

    const text = format`
      Global online: ${proxyText}
      Servers:
        ${serversText}
    `;

    return text
  }

  const text = await get();

  ctx.send(text);
  ctx.delete({ message_id: ctx.id });
}

export async function serverAlertCmdCb(ctx: CommandCtx) {
  if (!ctx.args || !ctx.args.length) {
    ctx.reply("Input message")
    return;
  }

  const message = ctx.args

  const rcon = getRcon()
  const result = await rcon.send(`alert ${message}`)

  ctx.send(`Call's result: ${result}`)
  ctx.send(`Message sent`)
  ctx.delete({ message_id: ctx.id })
}

export async function startCmdCb(ctx: CommandCtx) {
  const list = Array.from(GUARD_COMMANDS.keys())

  const kb = new Keyboard()
    .columns(2)
    .add(
      ...list.map((cmd) =>
        Keyboard.text(`/${cmd}`)
      )
    )

  const text = `Available cmds:\n${list.map(x => `/${x}`).join("\n")}`;

  ctx.send(text, { reply_markup: kb })
  ctx.delete({ message_id: ctx.id })
}

export async function publicStartCmdCb(ctx: CommandCtx) {
  ctx.send("Hi")
  ctx.delete({ message_id: ctx.id })
}