const User = require("../models/User");

async function sendMessageToAll(bot, message) {
  const users = await User.find({});
  for (const user of users) {
    try {
      await bot.sendMessage(user.telegramId, message);
    } catch (error) {
      console.error(
        `Xabar yuborishda xatolik (ID: ${user.telegramId}):`,
        error
      );
    }
  }
}

module.exports = { sendMessageToAll };
