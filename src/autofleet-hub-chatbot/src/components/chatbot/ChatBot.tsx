import React, { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatSuggestions from './ChatSuggestions';
import { useChatBot } from '../../hooks/useChatBot';
import { useChatHistory } from '../../hooks/useChatHistory';
import './chatbot.css';

const ChatBot: React.FC = () => {
  const { messages, sendMessage, fetchInitialMessages } = useChatBot();
  const { chatHistory } = useChatHistory();

  useEffect(() => {
    fetchInitialMessages();
  }, [fetchInitialMessages]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="chatbot-container">
      <ChatHeader />
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
      <ChatSuggestions />
    </div>
  );
};

export default ChatBot;