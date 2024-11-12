const axios = require("axios");

async function uploadParticipantToSheet(user) {
  try {
    const response = await axios.post(process.env.GOOGLE_SHEETS_URL, {
      telegramId: user.telegramId,
      username: user.username || "Noma'lum",
      firstName: user.firstName || "Noma'lum",
      lastName: user.lastName || "Noma'lum",
    });
    return response.data === "Success";
  } catch (error) {
    console.error("Google Sheets'ga yuklashda xatolik:", error);
    return false;
  }
}

module.exports = { uploadParticipantToSheet };
