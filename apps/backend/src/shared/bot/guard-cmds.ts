import type { Bot } from "gramio";
import { backendInfoCmdCb, botInfoCmdCb, publicStartCmdCb, serverAlertCmdCb, startCmdCb, statusCmdCb, updateSkinCmdCb } from "./cmds";

type CommandHandler = Parameters<Bot['command']>[1];
export type CommandCtx = Parameters<CommandHandler>[0];

export const GUARD_COMMANDS: Map<string, { 
  cb: (ctx: CommandCtx) => Promise<void>,
  publicCb?: (ctx: CommandCtx) => Promise<void>,
  type: "private" | "public" 
}> = new Map([
  ["start", {
    cb: startCmdCb,
    publicCb: publicStartCmdCb,
    type: "private"
  }],
  ["status", {
    cb: statusCmdCb,
    type: "private"
  }],
  ["updateskin", {
    cb: updateSkinCmdCb,
    type: "private"
  }],
  ["botinfo", {
    cb: botInfoCmdCb,
    type: "private"
  }],
  ["backendinfo", {
    cb: backendInfoCmdCb,
    type: "private"
  }],
  ["alert", {
    cb: serverAlertCmdCb,
    type: "private"
  }]
])