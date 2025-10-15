import { useState, useEffect } from 'react';
import { ChatMessage } from '../types/chatbot';

const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const addMessage = (message: ChatMessage) => {
    setChatHistory((prevHistory) => [...prevHistory, message]);
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  return {
    chatHistory,
    addMessage,
    clearHistory,
  };
};

export default useChatHistory;