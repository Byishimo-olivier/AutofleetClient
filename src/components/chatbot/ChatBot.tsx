import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatBot } from '../../hooks/useChatBot';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSuggestions from './ChatSuggestions';

interface ChatBotProps {
  className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    isConnected
  } = useChatBot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleNavigation = (url: string) => {
    navigate(url);
    setIsOpen(false); // Close chat after navigation
  };

  const suggestions = [
    "Browse vehicles",
    "My bookings", 
    "Dashboard",
    "Support",
    "Add vehicle",
    "Admin panel"
  ];

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-96 w-80'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">AutoFleet Assistant</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Hi! I'm your AutoFleet assistant.</p>
                  <p className="text-xs">I can help you navigate and answer questions!</p>
                </div>
              )}
              
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onNavigate={handleNavigation}
                />
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 0 && (
              <div className="px-4 pb-2">
                <ChatSuggestions 
                  suggestions={suggestions.slice(0, 3)} 
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <ChatInput 
                onSendMessage={handleSendMessage}
                disabled={isTyping || !isConnected}
                placeholder={isConnected ? "Ask me anything or request navigation..." : "Connecting..."}
              />
              
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700 mt-2 transition-colors"
                >
                  Clear conversation
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;