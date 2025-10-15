import { useState, useEffect } from 'react';
import { sendMessageToChatBot, receiveMessageFromChatBot } from '../services/chatBotAPI';
import { ChatMessage } from '../types/chatbot';

const useChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);

    try {
      const response = await sendMessageToChatBot(message);
      const botMessage: ChatMessage = {
        sender: 'bot',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};

export default useChatBot;