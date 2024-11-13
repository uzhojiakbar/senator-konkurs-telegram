const texts = require("../mock/texts");
const User = require("../models/User");
const Participant = require("../models/Participants");
const { uploadParticipantToSheet } = require("./googleSheets");
const { adminPanel } = require("./adminPanel");

async function handleUserCommands(bot, msg) {
  const chatId = msg.chat.id;
  const command = msg.text;

  // Foydalanuvchini ro'yxatdan o'tgan yoki o'tmaganligini tekshirish
  const isRegistered = await User.findOne({ telegramId: chatId });
  const isAdmin = chatId.toString() === process.env.ADMIN_TELEGRAM_ID;

  if (!isRegistered && !isAdmin) {
    bot.sendMessage(
      chatId,
      "Botdan foydalanish uchun avval ro'yxatdan o'ting va barcha kanallarga a'zo bo'ling."
    );
    return;
  }

  switch (command) {
    case "🎁 Ishtirok etish":
      const existingParticipant = await Participant.findOne({
        telegramId: chatId,
      });
      if (existingParticipant) {
        bot.sendMessage(chatId, texts.alreadyParticipating, {
          parse_mode: "Markdown",
        });
      } else {
        const newParticipant = new Participant({
          telegramId: chatId,
          username: msg.from.username,
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
        });
        await newParticipant.save();
        const uploadSuccess = await uploadParticipantToSheet(newParticipant);
        const message = uploadSuccess
          ? "Siz muvaffaqiyatli ishtirokchisiz va Google Sheets'ga qo'shildingiz!"
          : "Siz muvaffaqiyatli ishtirokchisiz, lekin Google Sheets'ga yuklashda xatolik yuz berdi.";
        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      }
      break;

    case "📜 Qatnashuvchilar":
      bot.sendMessage(
        chatId,
        `[Ishtirokchilar ro'yxatini bu yerdan ko'ring](${process.env.GOOGLE_SHEETS_URL})`,
        {
          parse_mode: "Markdown",
        }
      );
      break;

    case "👤 Profil":
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

    case "⚙️Panel":
      if (isAdmin) {
        adminPanel(bot, chatId);

        // bot.sendMessage(chatId, "Admin paneli:", {
        //   reply_markup: {
        //     keyboard: [
        //       [
        //         "📊 Statistikani ko'rish",
        //         "📤 Hamma foydalanuvchilarga xabar yuborish",
        //       ],
        //       ["🔙 Asosiy menyu"],
        //     ],
        //     resize_keyboard: true,
        //     one_time_keyboard: true,
        //   },
        // });
      }
      break;

    case "🔙 Asosiy menyu":
      userPanel(bot, chatId);
      break;

    default:
      bot.sendMessage(chatId, "Noma'lum buyruq.");
  }
}

function userPanel(bot, chatId) {
  const isAdmin = chatId.toString() === process.env.ADMIN_TELEGRAM_ID;
  const buttons = [
    ["🎁 Ishtirok etish"],
    ["📜 Qatnashuvchilar", "👤 Profil"],
    ["🎁 Konkurs haqida"],
  ];
  if (isAdmin) {
    buttons.push(["⚙️Panel"]);
  }

  bot.sendMessage(chatId, "Kerakli tugmani tanlang:", {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

module.exports = { userPanel, handleUserCommands };
