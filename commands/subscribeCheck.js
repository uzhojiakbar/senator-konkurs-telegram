const channels = require("../mocks/mockChannels");

async function getChannelId(bot, username) {
  try {
    const chat = await bot.getChat(username);
    return chat.id; // Kanalning ID'si qaytariladi
  } catch (error) {
    console.error(`Kanal ID’sini olishda xatolik: ${username}`, error);
    return null;
  }
}

async function subscribeCheck(bot, chatId) {
  try {
    const notSubscribedChannels = [];

    for (const channel of channels) {
      const channelId = await getChannelId(bot, channel.username); // Kanal ID'sini olish
      if (!channelId) {
        console.error(`Kanal topilmadi: ${channel.username}`);
        continue;
      }

      const memberStatus = await bot.getChatMember(channelId, chatId); // ID orqali obuna tekshirish
      if (!["member", "creator"].includes(memberStatus.status)) {
        notSubscribedChannels.push(channel);
      }
    }

    if (notSubscribedChannels.length === 0) {
      return true; // Barcha kanallarga obuna
    } else {
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
