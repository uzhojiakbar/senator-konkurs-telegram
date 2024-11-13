async function startCommand(bot, msg) {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Ro'yxatdan o'tish uchun telefon raqamingizni yuboring",
    {
      reply_markup: {
        keyboard: [[{ text: "Kontakt yuborish", request_contact: true }]],
        one_time_keyboard: true,
      },
    }
  );
}

module.exports = { startCommand };
