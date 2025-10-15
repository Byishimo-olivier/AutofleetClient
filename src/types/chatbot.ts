export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'typing' | 'navigation';
  navigationUrl?: string;
}

export interface ChatBotState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  sessionId: string;
}

export interface ChatBotResponse {
  message: string;
  suggestions?: string[];
  type?: 'text' | 'quick_reply' | 'navigation';
  navigationUrl?: string;
}

export interface ChatBotConfig {
  apiEndpoint: string;
  websocketUrl?: string;
  enableSuggestions: boolean;
  maxMessageLength: number;
  typingDelay: number;
}