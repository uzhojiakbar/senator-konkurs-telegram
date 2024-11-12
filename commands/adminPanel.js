function adminPanel(bot, chatId) {
  bot.sendMessage(chatId, "Admin paneli", {
    reply_markup: {
      keyboard: [
        ["📊 Bot Statistikasi"],
        ["🔊 Xabar yuborish"],
        ["🔙 Asosiy menyu"],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

module.exports = { adminPanel };
