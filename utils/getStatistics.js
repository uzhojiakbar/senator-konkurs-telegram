const User = require("../models/User");

async function getStatistics() {
  const userCount = await User.countDocuments();
  return `Bot foydalanuvchilari soni: ${userCount}`;
}

module.exports = { getStatistics };
