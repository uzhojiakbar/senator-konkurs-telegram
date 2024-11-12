const { subscribeCheck } = require("./subscribeCheck");

async function startCommand(bot, msg) {
  const chatId = msg.chat.id;

  if (await subscribeCheck(bot, chatId)) {
    bot.sendMessage(chatId, "Siz ro'yxatdan o'tishingiz mumkin!");
    bot.sendMessage(chatId, "Telefon raqamingizni yuboring", {
      reply_markup: {
        keyboard: [[{ text: "Kontakt yuborish", request_contact: true }]],
        one_time_keyboard: true,
      },
    });
  } else {
    bot.sendMessage(chatId, "Majburiy kanallarga a'zo bo'lishingiz kerak!");
  }
}

module.exports = { startCommand };
