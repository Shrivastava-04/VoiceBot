import React from "react";

const ChatBubble = ({ sender, text }) => {
  const isUser = sender === "user";

  return (
    <div className={`bubble-row ${isUser ? "user-row" : "bot-row"}`}>
      <div className={`bubble ${isUser ? "user" : "bot"}`}>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default ChatBubble;
