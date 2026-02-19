import { ChatBotResponse } from '../types/chatbot';
import { API_BASE_URL } from './apiClient';

interface ConversationContext {
  messages: Array<{ role: 'user' | 'assistant', content: string, timestamp?: number }>;
  lastNavigationUrl: string | null;
  awaitingConfirmation: boolean;
  userPreferences: Map<string, any>;
  sessionId?: string;
}

interface AIProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
}

class ChatBotAPI {
  private baseUrl: string;
  private context: ConversationContext;
  private aiProvider: AIProvider | null = null;
  private readonly MAX_CONTEXT_LENGTH = 10;

  // AutoFleet-specific context for AI
  private readonly AUTOFLEET_CONTEXT = `
You are AutoFleet's helpful AI assistant. AutoFleet is a car rental platform.

IMPORTANT NAVIGATION RULES:
- When users ask about browsing/viewing vehicles, respond with: {"action": "navigate", "url": "/vehicle"}
- When users ask about bookings/reservations, respond with: {"action": "navigate", "url": "/customer/my-bookings"}
- When users ask about dashboard/account, respond with: {"action": "navigate", "url": "/dashboard"}
- When users ask about support/help, respond with: {"action": "navigate", "url": "/customer/support"}
- When users want to list their vehicle, respond with: {"action": "navigate", "url": "/Vehicles"}
- When users ask about admin features, respond with: {"action": "navigate", "url": "/admin/reports"}

AUTOFLEET INFORMATION:
- Vehicle types: Economy ($25-35/day), Sedans ($35-50/day), SUVs ($45-65/day), Trucks ($55-75/day), Vans ($60-80/day)
- Locations: Main Office (123 AutoFleet St.), Airport (Terminal 2), Downtown (456 City Center)
- Requirements: Driver's license (1+ year), Credit card, Government ID
- Cancellation: 24+ hours (full refund), 2-24 hours (50% refund), <2 hours (no refund)
- Payment: Credit/debit cards, PayPal, bank transfer
- Home delivery available for $15 extra

Always be helpful, friendly, and concise. If you suggest navigation, include the action in your response.
  `;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.context = {
      messages: [],
      lastNavigationUrl: null,
      awaitingConfirmation: false,
      userPreferences: new Map()
    };

    // Initialize AI provider based on environment variables
    this.initializeAIProvider();
  }

  /**
   * Initialize AI provider based on available API keys
   */
  private initializeAIProvider(): void {
    // Check for OpenAI API key first
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.aiProvider = {
        name: 'openai',
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo'
      };
      console.log('🤖 Using OpenAI GPT');
    }
    // Check for Google Gemini API key
    else if (import.meta.env.VITE_GOOGLE_API_KEY) {
      this.aiProvider = {
        name: 'gemini',
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro'
      };
      console.log('🤖 Using Google Gemini');
    }
    // Check for Anthropic Claude API key
    else if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
      this.aiProvider = {
        name: 'claude',
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229'
      };
      console.log('🤖 Using Anthropic Claude');
    }
    else {
      console.log('⚠️ No AI API key found, using fallback responses');
    }
  }

  /**
   * Send message to AI API or fallback to keyword-based responses
   * Enhanced: Adds timestamp, sessionId to context, logs interactions
   */
  async sendMessage(
    message: string,
    sessionId: string,
    signal?: AbortSignal
  ): Promise<ChatBotResponse> {
    try {
      if (!message?.trim()) {
        throw new Error('Message cannot be empty');
      }

      // Add user message to context with timestamp
      this.addMessageToContext('user', message, Date.now());
      this.context.sessionId = sessionId;

      // Try AI API first, fallback to keyword-based if fails
      if (this.aiProvider) {
        try {
          const aiResponse = await this.sendToAI(message, signal);
          this.addMessageToContext('assistant', aiResponse.message, Date.now());
          this.logInteraction(message, aiResponse.message, sessionId);
          return aiResponse;
        } catch (aiError) {
          console.warn('AI API failed, falling back to keyword responses:', aiError);
        }
      }

      // Fallback to keyword-based responses
      const fallback = this.getFallbackResponse(message);
      this.addMessageToContext('assistant', fallback.message, Date.now());
      this.logInteraction(message, fallback.message, sessionId, true);
      return fallback;

    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errResp = this.getErrorResponse();
      this.addMessageToContext('assistant', errResp.message, Date.now());
      this.logInteraction(message, errResp.message, sessionId, true);
      return errResp;
    }
  }

  /**
   * Send message to AI provider
   */
  private async sendToAI(message: string, signal?: AbortSignal): Promise<ChatBotResponse> {
    if (!this.aiProvider) {
      throw new Error('No AI provider configured');
    }

    const response = await this.callAIAPI(message, signal);
    return this.parseAIResponse(response);
  }

  /**
   * Call the appropriate AI API based on provider
   */
  private async callAIAPI(message: string, signal?: AbortSignal): Promise<any> {
    if (!this.aiProvider) throw new Error('No AI provider');

    switch (this.aiProvider.name) {
      case 'openai':
        return this.callOpenAI(message, signal);
      case 'gemini':
        return this.callGemini(message, signal);
      case 'claude':
        return this.callClaude(message, signal);
      default:
        throw new Error(`Unknown AI provider: ${this.aiProvider.name}`);
    }
  }

  /**
   * Call OpenAI GPT API
   */
  private async callOpenAI(message: string, signal?: AbortSignal): Promise<any> {
    const messages = [
      { role: 'system', content: this.AUTOFLEET_CONTEXT },
      ...this.context.messages.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch(this.aiProvider!.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.aiProvider!.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.aiProvider!.model,
        messages,
        max_tokens: 300,
        temperature: 0.7,
        stream: false
      }),
      signal
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Call Google Gemini API
   */
  private async callGemini(message: string, signal?: AbortSignal): Promise<any> {
    const contextMessages = this.context.messages.slice(-6).map(msg =>
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const prompt = `${this.AUTOFLEET_CONTEXT}\n\nConversation history:\n${contextMessages}\n\nUser: ${message}\n\nAssistant:`;

    const response = await fetch(`${this.aiProvider!.endpoint}?key=${this.aiProvider!.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7
        }
      }),
      signal
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Call Anthropic Claude API
   */
  private async callClaude(message: string, signal?: AbortSignal): Promise<any> {
    const messages = [
      ...this.context.messages.slice(-8),
      { role: 'user', content: message }
    ];

    const response = await fetch(this.aiProvider!.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.aiProvider!.apiKey}`,
        'Content-Type': 'application/json',
        'x-api-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.aiProvider!.model,
        system: this.AUTOFLEET_CONTEXT,
        messages,
        max_tokens: 300,
        temperature: 0.7
      }),
      signal
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Parse AI response and extract navigation actions
   */
  private parseAIResponse(apiResponse: any): ChatBotResponse {
    let content = '';

    // Extract content based on provider
    if (this.aiProvider!.name === 'openai') {
      content = apiResponse.choices?.[0]?.message?.content || '';
    } else if (this.aiProvider!.name === 'gemini') {
      content = apiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (this.aiProvider!.name === 'claude') {
      content = apiResponse.content?.[0]?.text || '';
    }

    // Check for navigation actions in the response
    const navigationMatch = content.match(/{"action":\s*"navigate",\s*"url":\s*"([^"]+)"}/);

    let message = content;
    let navigationUrl: string | undefined = undefined;
    let type: 'navigation' | undefined = undefined;

    if (navigationMatch) {
      navigationUrl = navigationMatch[1];
      type = 'navigation';
      // Remove the JSON action from the message
      message = content.replace(navigationMatch[0], '').trim();
      this.context.lastNavigationUrl = navigationUrl;
    }

    // Generate contextual suggestions
    const suggestions = this.generateSuggestions(message, navigationUrl ?? null);

    return {
      message: message || "I'm here to help! What would you like to know about AutoFleet?",
      type,
      navigationUrl,
      suggestions
    };
  }

  /**
   * Generate contextual suggestions based on AI response
   */
  private generateSuggestions(message: string, navigationUrl: string | null): string[] {
    const lowerMessage = message.toLowerCase();

    if (navigationUrl) {
      const urlSuggestions: Record<string, string[]> = {
        '/vehicle': ["Filter by type", "Compare prices", "Check availability", "Book now"],
        '/customer/my-bookings': ["Modify booking", "Cancel booking", "Extend rental", "Support"],
        '/dashboard': ["Edit profile", "View activity", "Account settings", "Analytics"],
        '/customer/support': ["Live chat", "FAQs", "Contact us", "Report issue"],
        '/Vehicles': ["List my car", "Earning potential", "Requirements", "Get started"],
        '/admin/reports': ["User management", "Vehicle reports", "Analytics", "Settings"]
      };
      return urlSuggestions[navigationUrl] || ["Continue", "Need help?", "Go back"];
    }

    // Context-based suggestions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return ["Browse vehicles", "Compare prices", "Discounts available?", "Book now"];
    }

    if (lowerMessage.includes('book') || lowerMessage.includes('rent')) {
      return ["Browse vehicles", "My bookings", "Requirements", "Locations"];
    }

    if (lowerMessage.includes('cancel') || lowerMessage.includes('modify')) {
      return ["View bookings", "Cancellation policy", "Modify dates", "Support"];
    }

    // Default suggestions
    return ["Browse vehicles", "My bookings", "Pricing info", "Support"];
  }

  /**
   * Add message to conversation context (Enhanced: timestamp support)
   */
  private addMessageToContext(role: 'user' | 'assistant', content: string, timestamp?: number): void {
    this.context.messages.push({ role, content, timestamp });
    if (this.context.messages.length > this.MAX_CONTEXT_LENGTH) {
      this.context.messages.splice(1, 2);
    }
  }

  /**
   * Log interaction for analytics/debugging (Enhanced)
   */
  private logInteraction(userMsg: string, botMsg: string, sessionId: string, isFallback: boolean = false): void {
    // You can replace this with actual logging/analytics integration
    if (window && window.console) {
      console.log(`[ChatBot][${sessionId}] User: ${userMsg}`);
      console.log(`[ChatBot][${sessionId}] Bot${isFallback ? ' (fallback)' : ''}: ${botMsg}`);
    }
  }

  /**
   * Get conversation history (Enhanced)
   */
  public getConversationHistory(): Array<{ role: string, content: string, timestamp?: number }> {
    return [...this.context.messages];
  }

  /**
   * Get last navigation URL (Enhanced)
   */
  public getLastNavigationUrl(): string | null {
    return this.context.lastNavigationUrl;
  }

  /**
   * Fallback to keyword-based responses when AI fails
   */
  private getFallbackResponse(message: string): ChatBotResponse {
    const lowerMessage = message.toLowerCase();

    // Improved booking intent detection
    if (
      lowerMessage.includes('book a vehicle') ||
      lowerMessage.includes('book vehicle') ||
      lowerMessage.includes('book a car') ||
      lowerMessage.includes('rent a car') ||
      lowerMessage.includes('rent vehicle') ||
      lowerMessage.includes('make a booking') ||
      lowerMessage.includes('reserve a car') ||
      lowerMessage.includes('reserve vehicle')
    ) {
      return {
        message: "Great! Let's help you book a vehicle. 🚗",
        type: 'navigation',
        navigationUrl: '/vehicle',
        suggestions: ["View vehicles", "Compare prices", "Check availability", "Book now"]
      };
    }

    // Simple keyword matching for fallback
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        message: "Hello! 👋 I'm your AutoFleet assistant. How can I help you today?",
        suggestions: ["Browse vehicles", "My bookings", "Support", "How it works"]
      };
    }

    if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('browse')) {
      return {
        message: "I'll take you to browse our available vehicles! 🚗",
        type: 'navigation',
        navigationUrl: '/vehicle',
        suggestions: ["All vehicles", "SUVs", "Economy cars", "Luxury vehicles"]
      };
    }

    if (lowerMessage.includes('booking') || lowerMessage.includes('reservation')) {
      return {
        message: "Let me show you your bookings! 📋",
        type: 'navigation',
        navigationUrl: '/customer/my-bookings',
        suggestions: ["View details", "Modify booking", "Cancel", "Support"]
      };
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return {
        message: "Our rates: Economy $25-35/day, Sedans $35-50/day, SUVs $45-65/day, Trucks $55-75/day, Vans $60-80/day. All include insurance! 💰",
        suggestions: ["Browse vehicles", "Discounts?", "Book now", "Compare options"]
      };
    }

    if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return {
        message: "I'll connect you to our support center! 🆘",
        type: 'navigation',
        navigationUrl: '/customer/support',
        suggestions: ["Live chat", "FAQs", "Contact us", "Common issues"]
      };
    }

    // Default fallback
    return {
      message: "I'm here to help with AutoFleet! What would you like to know? 🌟",
      suggestions: ["Browse vehicles", "My bookings", "Pricing", "Support"]
    };
  }

  /**
   * Error response
   */
  private getErrorResponse(): ChatBotResponse {
    return {
      message: "I'm having trouble right now, but I'm still here to help! What can I assist you with? 😊",
      suggestions: ["Browse vehicles", "My bookings", "Support", "Try again"]
    };
  }

  /**
   * Clear conversation context
   */
  public clearContext(): void {
    this.context = {
      messages: [],
      lastNavigationUrl: null,
      awaitingConfirmation: false,
      userPreferences: new Map()
    };
  }

  /**
   * Check if AI is available
   */
  public isAIAvailable(): boolean {
    return this.aiProvider !== null;
  }

  /**
   * Get current AI provider
   */
  public getAIProvider(): string {
    return this.aiProvider?.name || 'keyword-fallback';
  }

  // Keep legacy method for compatibility
  async sendToRealAPI(message: string, sessionId: string): Promise<ChatBotResponse> {
    return this.sendMessage(message, sessionId);
  }
}

export const chatBotAPI = new ChatBotAPI();