import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatBotState } from '../types/chatbot';
import { chatBotAPI } from '../services/chatBotAPI';
import { generateId } from '../utils/chatHelpers';

export const useChatBot = () => {
  const [state, setState] = useState<ChatBotState>({
    messages: [],
    isTyping: false,
    isConnected: true,
    sessionId: generateId()
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    return newMessage;
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    setState(prev => ({ ...prev, isTyping }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Add user message
    addMessage({ content, sender: 'user' });

    // Set typing indicator
    setTyping(true);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Send to backend/AI service
      const response = await chatBotAPI.sendMessage(
        content, 
        state.sessionId,
        abortControllerRef.current.signal
      );

      // Add bot response with navigation data
      addMessage({ 
        content: response.message, 
        sender: 'bot',
        type: response.type,
        navigationUrl: response.navigationUrl
      });

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        
        // Add error message
        addMessage({ 
          content: 'Sorry, I\'m having trouble connecting right now. Please try again later.', 
          sender: 'bot' 
        });

        setState(prev => ({ ...prev, isConnected: false }));
      }
    } finally {
      setTyping(false);
      abortControllerRef.current = null;
    }
  }, [state.sessionId, addMessage, setTyping]);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      sessionId: generateId()
    }));
  }, []);

  const reconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: true,
      sessionId: generateId()
    }));
  }, []);

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    isConnected: state.isConnected,
    sendMessage,
    clearHistory,
    reconnect
  };
};