const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  username: String,
  firstName: String,
  lastName: String,
});

module.exports = mongoose.model("User", UserSchema);
