const { getStatistics } = require("../utils/getStatistics");

async function adminStats(bot, msg) {
  const chatId = msg.chat.id;
  try {
    const stats = await getStatistics();
    bot.sendMessage(chatId, stats);
  } catch (error) {
    console.error("Statistika olishda xatolik:", error);
    bot.sendMessage(chatId, "Xatolik yuz berdi.");
  }
}

module.exports = { adminStats };
