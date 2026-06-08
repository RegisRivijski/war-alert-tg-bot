function splitMessageIntoChunks(message) {
  const MAX_MESSAGE_LENGTH = 4096;
  const chunks = [];

  let start = 0;
  while (start < message.length) {
    let end = start + MAX_MESSAGE_LENGTH;
    if (end < message.length) {
      const lastNewLine = message.lastIndexOf('\n', end);
      if (lastNewLine > start) {
        end = lastNewLine + 1;
      }
    }
    chunks.push(message.slice(start, end).trim());
    start = end;
  }

  return chunks;
}

async function sendReplyInChunks(bot, channelId, reply) {
  const chunks = splitMessageIntoChunks(reply);

  for await (const chunk of chunks) {
    await bot.telegram.sendMessage(channelId, chunk, { parse_mode: 'Markdown' })
      .catch((e) => {
        console.error('Error sending chunk:', e.message);
      });
  }
}

async function sendUserMessageInChunks(ctx, message) {
  const chunks = splitMessageIntoChunks(message);

  for await (const chunk of chunks) {
    await ctx.reply(chunk, { parse_mode: 'Markdown' })
      .catch((e) => {
        console.error('Error sending chunk:', e.message);
      });
  }
}

async function sendDirectMessageInChunks(bot, chatId, message) {
  const chunks = splitMessageIntoChunks(message);

  for await (const chunk of chunks) {
    await bot.telegram.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
  }
}

module.exports = {
  sendReplyInChunks,
  sendUserMessageInChunks,
  sendDirectMessageInChunks,
};
