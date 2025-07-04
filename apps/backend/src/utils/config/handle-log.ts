import { bot } from "#/shared/bot/logger";

export async function handleFatalError(error: Error | unknown) {
  let message: string = ""
  
  if (error instanceof Error) {
    message = error.message
  } else {
    console.error('Unhandled Rejection:', error);
    message = `Unhandled Rejection: ${error}`
  }

  const text = `Сервис Fasberry Backend упал. \n${message}`

  try {
    await bot.api.sendMessage({ chat_id: 1114061179, text })
  } catch (e) {
    console.error('Failed to send Telegram message:', e);
  }

  process.exit(1);
}