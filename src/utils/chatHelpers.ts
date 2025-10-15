export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const sanitizeMessage = (message: string): string => {
  return message.trim().replace(/\s+/g, ' ');
};

export const isValidMessage = (message: string): boolean => {
  return message.trim().length > 0 && message.length <= 1000;
};

export const extractKeywords = (message: string): string[] => {
  const keywords = [
    'book', 'booking', 'reserve', 'rent',
    'price', 'cost', 'rate', 'fee',
    'cancel', 'refund', 'modify',
    'location', 'pickup', 'address',
    'document', 'license', 'id',
    'payment', 'card', 'pay',
    'vehicle', 'car', 'auto',
    'dashboard', 'account', 'profile',
    'support', 'help', 'contact',
    'admin', 'management', 'reports',
    'hello', 'hi', 'hey', 'greet',
    'thank', 'thanks', 'thx',
    'yes', 'no', 'okay', 'sure'
  ];
  
  const lowerMessage = message.toLowerCase();
  return keywords.filter(keyword => lowerMessage.includes(keyword));
};

export const getKeywordCategory = (keywords: string[]): string => {
  const categories = {
    booking: ['book', 'booking', 'reserve', 'rent'],
    pricing: ['price', 'cost', 'rate', 'fee'],
    cancellation: ['cancel', 'refund', 'modify'],
    location: ['location', 'pickup', 'address'],
    documents: ['document', 'license', 'id'],
    payment: ['payment', 'card', 'pay'],
    vehicle: ['vehicle', 'car', 'auto'],
    dashboard: ['dashboard', 'account', 'profile'],
    support: ['support', 'help', 'contact'],
    admin: ['admin', 'management', 'reports'],
    greeting: ['hello', 'hi', 'hey', 'greet'],
    gratitude: ['thank', 'thanks', 'thx'],
    confirmation: ['yes', 'okay', 'sure'],
    negation: ['no']
  };

  for (const [category, categoryKeywords] of Object.entries(categories)) {
    if (keywords.some(keyword => categoryKeywords.includes(keyword))) {
      return category;
    }
  }

  return 'general';
};