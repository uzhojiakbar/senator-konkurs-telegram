const User = require("../models/User");
const Participant = require("../models/Participants");
const Participants = require("../models/Participants");

async function adminPanel(bot, chatId) {
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

  bot.once("callback_query", async (query) => {
    const escapeMarkdown = (text) => {
      return text ? text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1") : "";
    };

    const chatId = query.message.chat.id;

    await bot.answerCallbackQuery(query.id);

    // Faqat admin uchun
    if (chatId.toString() !== process.env.ADMIN_TELEGRAM_ID) {
      return bot.answerCallbackQuery(query.id, {
        text: "Ushbu panel faqat admin uchun!",
      });
    }

    await bot.answerCallbackQuery(query.id);

    switch (query.data) {
      case "select_winner":
        const participants = await Participant.find({});
        if (participants.length === 0) {
          bot.sendMessage(chatId, "Ishtirokchilar topilmadi.");
        } else {
          // Tasodifiy g'olibni tanlaymiz
          const randomParticipant =
            participants[Math.floor(Math.random() * participants.length)];

          // Users kolleksiyasidan g'olibning to'liq ma'lumotlarini olamiz
          const winner = await User.findOne({
            telegramId: randomParticipant.telegramId,
          });

          if (!winner) {
            bot.sendMessage(
              chatId,
              "G'olibning to'liq ma'lumotlarini topib bo'lmadi."
            );
            break;
          }

          // Telefon raqamining o'rtasini *** bilan almashtirish
          const maskedPhone = winner.phoneNumber
            ? `${winner.phoneNumber.slice(0, 3)}***${winner.phoneNumber.slice(
                -2
              )}`
            : "Noma'lum";

          // Profilga o'tish uchun linkni to'g'ri formatlash
          const profileLink = winner.username
            ? `@${escapeMarkdown(winner.username)}`
            : `[Profilga o'tish](tg://user?id=${winner.telegramId})`;

          // G'olib haqida ma'lumot
          const winnerMessage =
            `🏆 *Yutgan foydalanuvchi:*\nIsmi: ${escapeMarkdown(
              winner.firstName || ""
            )}\n` +
            `Username: ${profileLink}\nTelefon: ${escapeMarkdown(maskedPhone)}`;

          const options = {
            parse_mode: "Markdown",
            reply_markup: winner.username
              ? {
                  inline_keyboard: [
                    [
                      {
                        text: "🔗 Profilga o'tish",
                        url: `https://t.me/${winner.username}`,
                      },
                    ],
                  ],
                }
              : undefined,
          };

          bot.sendMessage(chatId, winnerMessage, options);
        }
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
        const Ishtirokchilarsoni = await Participants.countDocuments();

        bot.sendMessage(
          chatId,
          `📊 *Statisika:*\n\n*Ro'yxatdan o'tganlar soni:* ${userCount} ta\n*Ishtirokchilar soni*: ${Ishtirokchilarsoni} ta\n\n*✅ Ishtirokchilar Ro'yxatini pastdagi tugma orqali korishingiz mumkin.*`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📄 Ro'yxatni ko'rish",
                    url:
                      process.env.GOOGLE_SHEET ||
                      "https://docs.google.com/spreadsheets/d/1ehW2KmLyV8tupP1Z6Wxg3DsNv4rq05VhXFF6FHwNBbU/edit?usp=sharing",
                  },
                ],
              ],
            },
          }
        );
        break;

      case "send_broadcast":
        bot.sendMessage(
          chatId,
          "Yuborish uchun quyidagi variantlardan birini tanlang:",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Oddiy habar yuborish",
                    callback_data: "broadcast_normal",
                  },
                ],
                [
                  {
                    text: "Forward habar yuborish",
                    callback_data: "broadcast_forward",
                  },
                ],
              ],
            },
          }
        );

        bot.once("callback_query", (broadcastTypeQuery) => {
          const type = broadcastTypeQuery.data;
          bot.answerCallbackQuery(broadcastTypeQuery.id);

          bot.sendMessage(chatId, "Endi xabaringizni yuboring:");

          bot.once("message", async (broadcastMsg) => {
            const allUsers = await User.find({}, "telegramId");
            console.log(allUsers);

            // const allUsers = await User.find({}, "telegramId");
            allUsers.forEach(async (user) => {
              try {
                if (type === "broadcast_normal") {
                  // Media yoki oddiy xabarni aniqlash
                  if (broadcastMsg.photo) {
                    await bot.sendPhoto(
                      user.telegramId,
                      broadcastMsg.photo[0].file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else if (broadcastMsg.video) {
                    await bot.sendVideo(
                      user.telegramId,
                      broadcastMsg.video.file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else if (broadcastMsg.audio) {
                    await bot.sendAudio(
                      user.telegramId,
                      broadcastMsg.audio.file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else if (broadcastMsg.document) {
                    await bot.sendDocument(
                      user.telegramId,
                      broadcastMsg.document.file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else {
                    await bot.sendMessage(
                      user.telegramId,
                      broadcastMsg.text || "",
                      { parse_mode: "HTML" }
                    );
                  }
                } else if (type === "broadcast_forward") {
                  await bot.forwardMessage(
                    user.telegramId,
                    chatId,
                    broadcastMsg.message_id
                  );
                }
              } catch (error) {
                console.error(
                  `Xatolik: ${user.telegramId} ga xabar yuborishda muammo!`
                );
              }
            });

            bot.sendMessage(
              chatId,
              "📨 Xabar barcha foydalanuvchilarga muvaffaqiyatli yuborildi."
            );
          });
        });
        break;
      case "close_menu":
        bot.deleteMessage(chatId, query.message.message_id);
        break;

      case "back_to_panel":
        adminPanel(bot, chatId);
        break;

      default:
        break;
    }
  });
}

module.exports = { adminPanel };
