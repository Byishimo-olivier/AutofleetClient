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
  type?: 'navigation' | 'confirmation' | 'error';
  navigationUrl?: string;
  suggestions?: string[];
  metadata?: {
    confidence?: number;
    provider?: string;
    sessionId?: string;
  };
}

export interface ChatBotConfig {
  apiEndpoint: string;
  websocketUrl?: string;
  enableSuggestions: boolean;
  maxMessageLength: number;
  typingDelay: number;
}