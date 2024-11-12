const User = require("../models/User");

module.exports.sendMessageToAll = async (bot, message) => {
  const users = await User.find({});
  users.forEach((user) => {
    bot.sendMessage(user.telegramId, message);
  });
};

module.exports.getStatistics = async () => {
  const userCount = await User.countDocuments();
  return `Bot foydalanuvchilari soni: ${userCount}`;
};
