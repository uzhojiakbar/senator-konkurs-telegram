function userPanel(bot, chatId) {
  bot.sendMessage(chatId, "Foydalanuvchi paneli", {
    reply_markup: {
      keyboard: [["📊 Statistikam"], ["ℹ️ Ma'lumot"]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

module.exports = { userPanel };
