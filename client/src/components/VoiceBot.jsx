import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChatBubble from "./ChatBubble";
import Loader from "./Loader";

const VoiceBot = () => {
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const url = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const chatEndRef = useRef(null);

  // 🔽 Auto-scroll when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔊 Text-to-Speech
  const speak = (text) => {
    const synth = window.speechSynthesis;

    synth.cancel(); // stop old speech if any

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synth.speak(utterance);
  };

  // 🎤 Speech Recognition
  const startListening = () => {
    // Stop bot voice if already speaking
    window.speechSynthesis.cancel();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);

      setMessages((prev) => [...prev, { sender: "user", text: transcript }]);
      setLoading(true);

      try {
        const res = await axios.post(`${url}/api/chat`, {
          message: transcript,
        });

        const reply = res.data.reply;

        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);

        speak(reply);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Sorry, something went wrong." },
        ]);
      }

      setLoading(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="voicebot-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <ChatBubble key={index} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <Loader />}
        <div ref={chatEndRef} />
      </div>

      <div className="controls">
        <button
          className={`mic-button ${listening ? "listening" : ""}`}
          onClick={startListening}
        >
          {listening ? "Listening..." : "🎤 Ask Me"}
        </button>
        <button
          className="pause-button"
          onClick={() => {
            window.speechSynthesis.cancel();
            setSpeaking(false);
          }}
          disabled={!speaking}
        >
          ⏸ Pause
        </button>
      </div>
    </div>
  );
};

export default VoiceBot;
