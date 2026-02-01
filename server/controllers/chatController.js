const axios = require("axios");
const systemPrompt = require("../utils/systemPrompt");

exports.handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + "\n\nUser Question: " + userMessage },
            ],
          },
        ],
      },
    );

    let aiReply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't respond properly.";

    // 🧹 Remove markdown formatting like **bold**, *, _, etc.
    aiReply = aiReply
      .replace(/\*\*/g, "") // remove **
      .replace(/\*/g, "") // remove *
      .replace(/__/g, "") // remove __
      .replace(/_/g, "") // remove _
      .replace(/`/g, "") // remove backticks
      .replace(/#+\s/g, "") // remove markdown headings
      .trim();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};
