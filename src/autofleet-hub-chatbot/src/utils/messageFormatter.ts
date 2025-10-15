export const formatMessage = (message: string, sender: 'user' | 'bot'): string => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${timestamp} - ${sender === 'user' ? 'You' : 'Bot'}: ${message}`;
};

export const formatChatHistory = (messages: Array<{ text: string; sender: 'user' | 'bot'; timestamp: Date }>): string[] => {
  return messages.map(msg => formatMessage(msg.text, msg.sender));
};