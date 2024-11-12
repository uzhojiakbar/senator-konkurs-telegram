require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const { startCommand } = require("./commands/start");
const { adminStats } = require("./commands/adminStats");
const { adminSend } = require("./commands/adminSend");
const { registerUser } = require("./commands/register");
const { userPanel, handleUserCommands } = require("./commands/userPanel");

const { adminPanel } = require("./commands/adminPanel");
const { subscribeCheck } = require("./commands/subscribeCheck");
const texts = require("./mock/texts");

// MongoDB ulanish
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDBga muvaffaqiyatli ulandi ✅"))
  .catch((err) => console.error("MongoDBga ulanishda xatolik: ❌", err));

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log("Bot faol! 👋");

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  if (await subscribeCheck(bot, chatId)) {
    bot.sendMessage(chatId, texts.competitionInfo, { parse_mode: "Markdown" });
    userPanel(bot, chatId);
  }
});

bot.on("contact", async (msg) => {
  const chatId = msg.chat.id;

  if (await subscribeCheck(bot, chatId)) {
    registerUser(bot, msg);
  }
});

bot.onText(/\/admin_stats/, async (msg) => {
  const chatId = msg.chat.id;

  if (await subscribeCheck(bot, chatId)) {
    adminStats(bot, msg);
  }
});

bot.onText(/\/admin_send (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (await subscribeCheck(bot, chatId)) {
    adminSend(bot, msg, match);
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "check_subscription") {
    if (await subscribeCheck(bot, chatId)) {
      bot.sendMessage(
        chatId,
        "Rahmat! Siz endi botdan to'liq foydalanishingiz mumkin."
      );
      const isAdmin = chatId.toString() === process.env.ADMIN_TELEGRAM_ID;
      if (isAdmin) {
        adminPanel(bot, chatId); // Admin panelini ko'rsatish
      } else {
        userPanel(bot, chatId); // Foydalanuvchi panelini ko'rsatish
      }
    } else {
      bot.sendMessage(
        chatId,
        "Siz hali hamma kanallarga a'zo bo'lmagansiz. Iltimos, barcha kanallarga a'zo bo'ling va yana tekshiring."
      );
    }
  }
});

// Foydalanuvchi paneli va admin paneli uchun umumiy tekshiruv
// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;

//   if (await subscribeCheck(bot, chatId)) {
//     const isAdmin = msg.from.id.toString() === process.env.ADMIN_TELEGRAM_ID;

//     if (isAdmin) {
//       adminPanel(bot, chatId); // Admin panelini ko'rsatish
//     } else {
//       userPanel(bot, chatId); // Foydalanuvchi panelini ko'rsatish
//     }
//   }
// });
bot.on("message", async (msg) => {
  if (await subscribeCheck(bot, msg.chat.id)) {
    const isAdmin = msg.from.id.toString() === process.env.ADMIN_TELEGRAM_ID;
    if (isAdmin) {
      adminPanel(bot, msg.chat.id); // Admin panelini ko'rsatish
    } else {
      handleUserCommands(bot, msg);
    }
  }
});
