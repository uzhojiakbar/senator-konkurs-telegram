const channels = require("../mocks/mockChannels");

async function subscribeCheck(bot, chatId) {
  try {
    const notSubscribedChannels = [];

    for (const channel of channels) {
      const memberStatus = await bot.getChatMember(channel.username, chatId);
      if (!["member", "creator"].includes(memberStatus.status)) {
        notSubscribedChannels.push(channel);
      }
    }

    if (notSubscribedChannels.length === 0) {
      return true; // Foydalanuvchi barcha kanallarga obuna
    } else {
      // Faqat bir marta xabar yuborish uchun tugmalar va xabarni yuboramiz
      const buttons = notSubscribedChannels.map((channel) => [
        {
          text: `➕ ${channel.name}`,
          url: `https://t.me/${channel.username.slice(1)}`,
        },
      ]);
      buttons.push([
        { text: "☑️ Tekshirish", callback_data: "check_subscription" },
      ]);

      await bot.sendMessage(
        chatId,
        "Majburiy kanallarga a'zo bo'lishingiz kerak!",
        {
          reply_markup: {
            inline_keyboard: buttons,
          },
        }
      );
      return false;
    }
  } catch (error) {
    console.error("Obuna tekshiruvi xatoligi:", error);
    return false;
  }
}

module.exports = { subscribeCheck };
