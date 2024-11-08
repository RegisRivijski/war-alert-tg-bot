async function sendReplyInChunks(bot, channelId, reply) {
  const MAX_MESSAGE_LENGTH = 4096; // Максимальная длина сообщения в Telegram
  const chunks = [];

  let start = 0;
  while (start < reply.length) {
    // Найдем позицию, чтобы завершить текущий блок на новой строке, но не превышать лимит
    let end = start + MAX_MESSAGE_LENGTH;
    if (end < reply.length) {
      const lastNewLine = reply.lastIndexOf('\n', end);
      if (lastNewLine > start) {
        end = lastNewLine + 1; // Обрезаем на последнем символе новой строки
      }
    }
    chunks.push(reply.slice(start, end).trim());
    start = end;
  }

  for await (const chunk of chunks) {
    await bot.telegram.sendMessage(channelId, chunk, { parse_mode: 'Markdown' })
      .catch((e) => {
        console.error('Error sending chunk:', e.message);
      });
  }
}

async function sendUserMessageInChunks(ctx, message) {
  const MAX_MESSAGE_LENGTH = 4096; // Максимальная длина сообщения в Telegram
  const chunks = [];

  let start = 0;
  while (start < message.length) {
    // Найдем позицию, чтобы завершить текущий блок на новой строке, но не превышать лимит
    let end = start + MAX_MESSAGE_LENGTH;
    if (end < message.length) {
      const lastNewLine = message.lastIndexOf('\n', end);
      if (lastNewLine > start) {
        end = lastNewLine + 1; // Обрезаем на последнем символе новой строки
      }
    }
    chunks.push(message.slice(start, end).trim());
    start = end;
  }

  for await (const chunk of chunks) {
    await ctx.reply(chunk, { parse_mode: 'Markdown' })
      .catch((e) => {
        console.error('Error sending chunk:', e.message);
      });
  }
}

module.exports = {
  sendReplyInChunks,
  sendUserMessageInChunks,
};
