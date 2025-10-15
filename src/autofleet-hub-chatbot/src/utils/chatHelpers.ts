import { v4 as uuidv4 } from 'uuid';

export const generateMessageId = () => {
  return uuidv4();
};

export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

export const formatMessageContent = (content: string) => {
  return content.trim();
};