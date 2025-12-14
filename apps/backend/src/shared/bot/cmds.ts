import { initPlayerSkin, updatePlayersSkins } from "#/modules/server/skin/skin.model";
import { type Bot, format, type MessageContext } from "gramio";
import { botLogger, getGuardBot } from "./guard";
import { getServerStatus } from "#/modules/server/status/status.model";
import { type CommandCtx, GUARD_COMMANDS } from "./guard-cmds";
import { Keyboard } from "gramio";
import { getRcon } from "../rcon/init";
import { getChats } from "../constants/chats";
import { getUrls } from "../constants/urls";

export async function botInfoCmdCb(ctx: CommandCtx) {
  const text = format`
    Loaded cmds: ${Array.from(GUARD_COMMANDS.entries()).map(([cmd, pd]) => `${cmd}: ${pd.type}`)}
  `
  
  ctx.reply(text)
}

export async function backendInfoCmdCb(ctx: CommandCtx) {
  const chats = getChats();
  const urls = getUrls()

  const text = format`
    Chats: ${chats.map((d) => d).join(", ")}
    Urls: ${Object.entries(urls).map(([ka, v]) => `${ka}: ${v}`)}
  `

  ctx.reply(text)
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
    ? `Start updating player ${targetPlayer}`
    : `Start updating players skins. Args: ${Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(", ")}`

  async function startEvent<T>(
    ctx: MessageContext<Bot>,
    chat_id: string,
    fn: () => Promise<T>,
    startMsg: string,
    finishMsg: (payload: T) => string
  ) {
    try {
      await ctx.reply(startMsg)

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
    (payload) => `Result: 
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
      ? `${servers.map(([server, { online, max }]) => `${server}:${online}/${max}`).join("\n") ?? "n/a"}`
      : "n/a"

    const text = format`
      Global online: ${proxyText}
      Servers:
        ${serversText}
    `;

    ctx.delete({ message_id: id });
    ctx.reply(text);
  }

  const { id } = await ctx.reply("Loading...")

  get();
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
  ctx.reply(`Message sent`)
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
}

export async function publicStartCmdCb(ctx: CommandCtx) {
  ctx.reply("Hi")
}