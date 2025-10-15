import React from 'react';
import ChatBot from '../chatbot/ChatBot';
import './chatbot.css';

const ChatBotContainer: React.FC = () => {
  return (
    <div className="chatbot-container">
      <ChatBot />
    </div>
  );
};

export default ChatBotContainer;