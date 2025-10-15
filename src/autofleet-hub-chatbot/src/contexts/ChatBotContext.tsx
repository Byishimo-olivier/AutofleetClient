import React, { createContext, useContext, useState } from 'react';
import { ChatMessage, ChatResponse } from '../types/chatbot';
import { sendMessageToBot } from '../services/chatBotAPI';

interface ChatBotContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export const ChatBotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = async (message: string) => {
    const userMessage: ChatMessage = { sender: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response: ChatResponse = await sendMessageToBot(message);
      const botMessage: ChatMessage = { sender: 'bot', content: response.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to bot:', error);
    }
  };

  return (
    <ChatBotContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatBotContext.Provider>
  );
};

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};