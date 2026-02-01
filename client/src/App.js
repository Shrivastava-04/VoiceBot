import React from "react";
import VoiceBot from "./components/VoiceBot";
import "./style.css";

function App() {
  return (
    <div className="app">
      <div className="app-container">
        <h1 className="title">🎙️ Harshit AI Voice Bot</h1>
        <p className="subtitle">
          Ask me anything about my skills, journey, and strengths
        </p>
        <VoiceBot />
      </div>
    </div>
  );
}

export default App;
