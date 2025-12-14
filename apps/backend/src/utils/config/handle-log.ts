import { getLoggerBot } from "#/shared/bot/logger";
import { getChats } from "#/shared/constants/chats";
import { isProduction } from "#/shared/env";

export async function handleFatalError(error: Error | unknown) {
  if (!isProduction) return;

  let message: string = ""
  
  if (error instanceof Error) {
    message = error.message
  } else {
    message = `Unhandled Rejection: ${error}`
  }

  console.error('Unhandled Rejection:', error);

  try {
    getLoggerBot()
      .api
      .sendMessage({ chat_id: getChats()[0], text: message })
  } catch (e) {
    console.error(e);
  }

  process.exit(1);
}