import React from 'react';
import './chatbot.css';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser }) => {
  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'bot'}`}>
      <p>{message}</p>
    </div>
  );
};

export default ChatBubble;