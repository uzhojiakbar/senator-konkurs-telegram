// const texts = require("../mocks/texts");
const User = require("../models/User");
const Participant = require("../models/Participants");

// Admin panelini ko'rsatish
async function adminPanel(bot, chatId) {
  function escapeMarkdown(text) {
    return text.replace(
      /(\*|_|\[|\]|\(|\)|~|`|>|#|\+|-|=|\||{|}|\.|!)/g,
      "\\$1"
    );
  }

  bot.sendMessage(chatId, "🔧 *Admin paneliga xush kelibsiz!*", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🏆 Yutgan foydalanuvchini aniqlash",
            callback_data: "select_winner",
          },
        ],
        [{ text: "👥 Ishtirokchilar", callback_data: "show_participants" }],
        [{ text: "📢 Majburiy kanallar", callback_data: "manage_channels" }],
        [{ text: "📊 Statistika", callback_data: "show_stats" }],
        [{ text: "✉️ Habar yuborish", callback_data: "send_broadcast" }],
        [{ text: "❌ Menyuni yopish", callback_data: "close_menu" }],
      ],
    },
  });
  // Tugmalarni boshqarish
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;

    if (chatId.toString() !== process.env.ADMIN_TELEGRAM_ID) {
      return bot.answerCallbackQuery(query.id, {
        text: "Ushbu panel faqat admin uchun!",
      });
    }

    await bot.answerCallbackQuery(query.id);

    switch (query.data) {
      case "select_winner":
        function escapeMarkdown(text) {
          return text
            .replace(/[\\\`*\_\[\]\(\)\#\+\-\.\!\>]/g, "\\$&")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\&/g, "\\&");
        }
        const participants = await Participant.find({});
        if (participants.length === 0) {
          bot.sendMessage(chatId, "Ishtirokchilar topilmadi.");
        } else {
          const winner =
            participants[Math.floor(Math.random() * participants.length)];

          // Users modelidan telefon raqamini olish
          const user = await User.findOne({ telegramId: winner.telegramId });
          const winnerName = escapeMarkdown(winner.firstName || "Noma'lum");
          const maskedPhoneNumber = user
            ? escapeMarkdown(
                user.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1***$3")
              )
            : "Telefon raqami mavjud emas";

          // Profilga o'tish uchun tugma tayyorlash
          const profileLink = winner.username
            ? `https://t.me/${winner.username}`
            : `tg://user?id=${winner.telegramId}`;
          const showFullNumberLink = `/show_full_number_${winner.telegramId}`;

          const winnerMessage = `🏆 *Yutgan foydalanuvchi:*\n*Ism:* ${winnerName}\n*Username:* @${
            winner.username || "yo'q"
          }\n*Telefon raqami:* ${maskedPhoneNumber}`;

          bot.sendMessage(chatId, winnerMessage, {
            parse_mode: "MarkdownV2",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🔗 Profilga o‘tish", url: profileLink }],
                [
                  {
                    text: "📞 Raqamni to'liq ko'rsatish",
                    callback_data: showFullNumberLink,
                  },
                ],
              ],
            },
          });
        }
        break;

      case "show_participants":
        bot.sendMessage(
          chatId,
          `Ishtirokchilar ro'yxati: ${process.env.GOOGLE_SHEETS_URL}`
        );
        break;

      case "manage_channels":
        bot.sendMessage(chatId, "📢 Majburiy kanallarni boshqarish:", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "➕ Kanal qo'shish", callback_data: "add_channel" }],
              [
                {
                  text: "➖ Kanalni o'chirish",
                  callback_data: "remove_channel",
                },
              ],
              [
                {
                  text: "🔄 Tartibni o'zgartirish",
                  callback_data: "reorder_channels",
                },
              ],
              [{ text: "🔙 Ortga", callback_data: "back_to_panel" }],
            ],
          },
        });
        break;

      case "show_stats":
        const userCount = await User.countDocuments();
        bot.sendMessage(chatId, `📊 *Foydalanuvchilar soni:* ${userCount}`, {
          parse_mode: "Markdown",
        });
        break;

      case "send_broadcast":
        bot.sendMessage(chatId, "Yuborish uchun xabaringizni yozing.");
        bot.once("message", async (broadcastMsg) => {
          const allUsers = await User.find({});
          allUsers.forEach((user) => {
            bot.sendMessage(user.telegramId, broadcastMsg.text);
          });
          bot.sendMessage(
            chatId,
            "📨 Xabar barcha foydalanuvchilarga yuborildi."
          );
        });
        break;

      case "close_menu":
        bot.deleteMessage(chatId, query.message.message_id);
        break;

      case "back_to_panel":
        adminPanel(bot, chatId);
        break;

      default:
        bot.answerCallbackQuery(query.id, { text: "Noma'lum buyruq." });
    }
  });
}

module.exports = { adminPanel };
