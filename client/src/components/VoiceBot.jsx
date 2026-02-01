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

  // 🔊 Text-to-Speech (Prefers Indian Male Voice)
  const speak = (text) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // stop old speech if any

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    const setVoiceAndSpeak = () => {
      const voices = synth.getVoices();

      if (!voices.length) {
        synth.speak(utterance);
        return;
      }

      // 1️⃣ Try Indian English MALE voice
      let selectedVoice = voices.find(
        (v) =>
          v.lang === "en-IN" &&
          (v.name.toLowerCase().includes("male") ||
            v.name.toLowerCase().includes("ravi") ||
            v.name.toLowerCase().includes("aditya")),
      );

      // 2️⃣ Fallback: Any Indian English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang === "en-IN");
      }

      // 3️⃣ Fallback: English male voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.toLowerCase().includes("male") ||
              v.name.toLowerCase().includes("david") ||
              v.name.toLowerCase().includes("alex") ||
              v.name.toLowerCase().includes("mark")),
        );
      }

      // 4️⃣ Final fallback: Any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith("en"));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      synth.speak(utterance);
    };

    // Some browsers load voices asynchronously
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = setVoiceAndSpeak;
    } else {
      setVoiceAndSpeak();
    }
  };

  // 🎤 Speech Recognition
  const startListening = () => {
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

    recognition.onstart = () => setListening(true);

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

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

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
