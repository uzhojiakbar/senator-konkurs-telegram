const { sendMessageToAll } = require("../utils/sendMessageToAll");

function adminSend(bot, msg, match) {
  const chatId = msg.chat.id;
  const message = match[1];

  sendMessageToAll(bot, message)
    .then(() => bot.sendMessage(chatId, "Xabar yuborildi."))
    .catch((error) => {
      console.error("Xabar yuborishda xatolik:", error);
      bot.sendMessage(chatId, "Xatolik yuz berdi.");
    });
}

module.exports = { adminSend };
