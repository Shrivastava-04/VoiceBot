const axios = require("axios");
const systemPrompt = require("../utils/systemPrompt");

exports.handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mixtral-8x7b-instruct", // good free model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    let aiReply =
      response.data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't respond properly.";

    // 🧹 Remove markdown symbols for clean speech
    aiReply = aiReply
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/__/g, "")
      .replace(/_/g, "")
      .replace(/`/g, "")
      .replace(/#+\s/g, "")
      .trim();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error(error.response?.data || error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: "AI is busy right now. Please wait a moment and try again.",
      });
    }

    res.status(500).json({ error: "Something went wrong" });
  }
};
