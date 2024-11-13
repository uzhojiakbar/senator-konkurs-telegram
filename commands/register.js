const texts = require("../mock/texts");
const User = require("../models/User");
const { userPanel } = require("./userPanel");

async function registerUser(bot, msg) {
  const { contact } = msg;
  const chatId = msg.chat.id;

  if (contact) {
    try {
      const user = new User({
        telegramId: msg.from.id,
        phoneNumber: contact.phone_number,
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
      });
      await user.save();
      bot.sendMessage(chatId, texts.userRegisterSuccesful, {
        parse_mode: "Markdown",
      });
      userPanel(bot, chatId);
    } catch (error) {
      console.error("Foydalanuvchini saqlashda xatolik:", error);
      bot.sendMessage(
        chatId,
        "Xatolik yuz berdi. Keyinroq qayta urinib ko'ring."
      );
    }
  }
}

module.exports = { registerUser };
