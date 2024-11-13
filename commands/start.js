const User = require("../models/User");

async function startCommand(bot, msg) {
  const chatId = msg.chat.id;

  const isRegistered = await User.findOne({ telegramId: chatId });

  if (!isRegistered) {
    bot.sendMessage(
      chatId,
      `*🌟 Ro'yxatdan o'tish uchun telefon raqamingizni yuboring 🌟*`,
      {
        parse_mode: "Markdown",

        reply_markup: {
          keyboard: [[{ text: "Kontakt yuborish", request_contact: true }]],
          resize_keyboard: true, // Tugma hajmini kichikroq qilish
          one_time_keyboard: true,
        },
      }
    );
  } else {
  }
}

module.exports = { startCommand };
