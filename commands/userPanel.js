const texts = require("../mock/texts");
const User = require("../models/User");
const Participant = require("../models/Participants"); // Yangi qatnashuvchilar collection
const { uploadParticipantToSheet } = require("./googleSheets");

async function handleUserCommands(bot, msg) {
  const chatId = msg.chat.id;
  const command = msg.text;

  switch (command) {
    case "🎁 Ishtirok etish":
      // Qatnashuvchilar collection'ida foydalanuvchini tekshirish
      const existingParticipant = await Participant.findOne({
        telegramId: chatId,
      });
      if (existingParticipant) {
        bot.sendMessage(chatId, texts.alreadyParticipating, {
          parse_mode: "Markdown",
        });
      } else {
        // Qatnashuvchilar collection'ga yangi foydalanuvchini qo'shish
        const newParticipant = new Participant({
          telegramId: chatId,
          username: msg.from.username,
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
        });
        await newParticipant.save();

        // Google Sheets'ga yuklash
        const uploadSuccess = await uploadParticipantToSheet(newParticipant);
        const message = uploadSuccess
          ? "Siz muvaffaqiyatli ishtirokchisiz va Google Sheets'ga qo'shildingiz!"
          : "Siz muvaffaqiyatli ishtirokchisiz, lekin Google Sheets'ga yuklashda xatolik yuz berdi.";
        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      }
      break;

    case "📜 Qatnashuvchilar":
      // Qatnashuvchilar ro'yxati uchun Google Sheets linkini yuborish
      bot.sendMessage(
        chatId,
        `[Ishtirokchilar ro'yxatini bu yerdan ko'ring](https://docs.google.com/spreadsheets/d/1ehW2KmLyV8tupP1Z6Wxg3DsNv4rq05VhXFF6FHwNBbU/edit?usp=sharing)`,
        {
          parse_mode: "Markdown",
        }
      );
      break;

    case "👤 Profil":
      // Foydalanuvchi ma'lumotlarini yangilash va ko'rsatish
      const user = await User.findOneAndUpdate(
        { telegramId: chatId },
        {
          username: msg.from.username,
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
        },
        { new: true }
      );
      if (user) {
        const profileMessage = `${texts.profileIntro} \n*ID:* ${
          user.telegramId
        }\n*Ism:* ${user.firstName || "Noma'lum"}\n*Telefon:* ${
          user.phoneNumber || "Noma'lum"
        }`;
        bot.sendMessage(chatId, profileMessage, { parse_mode: "Markdown" });
      } else {
        bot.sendMessage(chatId, "Profil ma'lumotlari topilmadi.");
      }
      break;

    case "🎁 Konkurs haqida":
      bot.sendMessage(chatId, texts.competitionInfo, {
        parse_mode: "Markdown",
      });
      break;

    default:
      bot.sendMessage(chatId, "Noma'lum buyruq.");
  }
}

function userPanel(bot, chatId) {
  bot.sendMessage(chatId, "Kerakli tugmani tanlang:", {
    reply_markup: {
      keyboard: [
        ["🎁 Ishtirok etish"],
        ["📜 Qatnashuvchilar", "👤 Profil"],
        ["🎁 Konkurs haqida"],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

module.exports = { userPanel, handleUserCommands };
