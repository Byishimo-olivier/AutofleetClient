import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Navigation, Globe2, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingContxt';
import { useAuth } from '@/contexts/AuthContext';
import { chatBotAPI } from '@/services/chatBotAPI';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'navigation' | 'error' | 'confirmation';
  suggestions?: string[];
  navigationUrl?: string;
}

interface ChatBotProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'blue' | 'green' | 'purple';
}

const LANGUAGES = ['English', 'Spanish', 'French', 'German'];

const ChatBot: React.FC<ChatBotProps> = ({
  position = 'bottom-right',
  theme = 'blue'
}) => {
  const { settings } = useSettings();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [aiProvider, setAiProvider] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [role, setRole] = useState<string>('Customer');
  const [personalized, setPersonalized] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync role with authenticated user
  useEffect(() => {
    if (user?.role) {
      // Map backend roles to ChatBot display roles
      const roleMap: Record<string, string> = {
        'admin': 'Admin',
        'owner': 'Fleet Owner',
        'customer': 'Customer'
      };
      setRole(roleMap[user.role] || 'Customer');
      setPersonalized(true);
    }
  }, [user]);

  // Get AI provider info on mount
  useEffect(() => {
    setAiProvider(chatBotAPI.getAIProvider());
  }, []);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText = isAuthenticated && user
        ? `Hi ${user.first_name || ''}! I'm your AutoFleet AI assistant. I'm ready to help you as a ${role}.`
        : `Hi! I'm your AutoFleet AI assistant. Please type your message or select a language to get started.`;

      const welcomeMessage: Message = {
        id: '1',
        text: welcomeText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        suggestions: isAuthenticated ? getRoleSuggestions(role) : LANGUAGES
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, aiProvider, isAuthenticated, user, role]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending messages
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Enhanced prompt with role/language/personalization
      const prompt = `[Role: ${role}] [Language: ${language}] [Personalized: ${personalized}] ${text.trim()}`;
      const response = await chatBotAPI.sendMessage(
        prompt,
        sessionId,
        abortControllerRef.current.signal
      );

      // Booking guidance and recommendations
      let suggestions = response.suggestions;
      if (role === 'Customer' && /rent|book|vehicle/i.test(text)) {
        suggestions = ['SUV for 3 days', 'Sedan for 1 week', 'Electric car options', 'Show available vehicles'];
      }
      // Admin/owner analytics
      if ((role === 'Fleet Owner' || role === 'Admin') && /dashboard|metrics|trend|utilization|feedback/i.test(text)) {
        suggestions = ['Summarize rental trends', 'Show underutilized vehicles', 'Analyze feedback', 'Peak rental periods'];
      }
      // Feedback analysis
      if (/feedback|review|complaint|rating/i.test(text)) {
        suggestions = ['Summarize feedback', 'Show common complaints', 'Customer satisfaction patterns'];
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type || 'text',
        suggestions: suggestions,
        navigationUrl: response.navigationUrl
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      console.error('❌ ChatBot API error:', error);

      if (error.name === 'AbortError') {
        console.log('🚫 Request was cancelled');
        return;
      }

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment! 😊",
        sender: 'bot',
        timestamp: new Date(),
        type: 'error',
        suggestions: ['Try again', 'Browse vehicles', 'Get support']
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // Handle suggestion clicks (languages, booking, etc.)
  const handleSuggestionClick = (suggestion: string) => {
    if (LANGUAGES.includes(suggestion)) {
      setLanguage(suggestion);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Language set to ${suggestion}. How can I assist you today?`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'confirmation',
          suggestions: getRoleSuggestions(role)
        }
      ]);
      return;
    }
    handleSendMessage(suggestion);
  };

  // Role-based quick suggestions
  const getRoleSuggestions = (currentRole: string) => {
    switch (currentRole) {
      case 'Customer':
        return ['Browse vehicles', 'View my bookings', 'Pricing info', 'Get support', 'Rent an SUV'];
      case 'Fleet Owner':
        return ['View dashboard', 'Rental trends', 'Utilization report', 'Feedback analysis'];
      case 'Admin':
        return ['System metrics', 'Peak rental periods', 'Underutilized vehicles', 'Review feedback'];
      default:
        return ['Help', 'Browse vehicles'];
    }
  };

  // Voice input placeholder (future enhancement)
  const handleVoiceInput = () => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: "Voice input is coming soon! For now, please type your message.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'confirmation'
      }
    ]);
  };

  // Handle navigation
  const handleNavigation = (url: string) => {
    console.log('🧭 Navigating to:', url);
    navigate(url);

    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      text: `Great! I'm taking you to ${url}. Is there anything else I can help you with?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      suggestions: ['Yes, help me more', 'Browse vehicles', 'My bookings', 'Support']
    };

    setMessages(prev => [...prev, confirmMessage]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const themeClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  const getProviderIcon = () => {
    switch (aiProvider) {
      case 'openai': return '🤖';
      case 'gemini': return '🔮';
      case 'claude': return '🧠';
      default: return '💬';
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <button
          onClick={() => setIsOpen(true)}
          className={`${themeClasses[theme]} text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group`}
          aria-label="Open AI chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
          {chatBotAPI.isAIAvailable() && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getProviderIcon()}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className={`${settings?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-2xl border transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
        {/* Header */}
        <div className={`${themeClasses[theme]} text-white p-4 rounded-t-lg flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">AutoFleet AI Assistant</h3>
              <p className="text-xs opacity-90">
                {isTyping ? 'AI is thinking...' : `Powered by ${aiProvider.toUpperCase()} | ${role} | ${language}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPersonalized(!personalized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label="Toggle personalized"
            >
              <Globe2 className={`w-4 h-4 ${personalized ? 'text-yellow-400' : 'text-white'}`} />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                // Clear context when closing
                chatBotAPI.clearContext();
                setMessages([]);
              }}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-2 ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  {message.sender === 'bot' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                      <Bot className={`w-4 h-4 ${message.type === 'error' ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                  )}

                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${message.sender === 'bot'
                    ? message.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : settings?.darkMode
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-100 text-gray-800'
                    : themeClasses[theme].replace('hover:', '') + ' text-white'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                    {/* Navigation button */}
                    {message.navigationUrl && (
                      <button
                        onClick={() => handleNavigation(message.navigationUrl!)}
                        className="mt-2 flex items-center gap-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        Go there
                      </button>
                    )}

                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.sender === 'user' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${themeClasses[theme].replace('hover:', '')}`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className={`${settings?.darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-xs text-gray-500 ml-2">AI thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && !isTyping && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${settings?.darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`p-4 border-t ${settings?.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputValue)}
                  placeholder={`Ask me anything about AutoFleet... (${role}, ${language})`}
                  disabled={isTyping}
                  className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 ${settings?.darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className={`${themeClasses[theme]} text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {/* Security/privacy reminder */}
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-400">
                  {chatBotAPI.isAIAvailable()
                    ? <>Powered by {aiProvider.toUpperCase()} AI {getProviderIcon()} | Your data is protected</>
                    : 'Using keyword responses'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;