import axios from 'axios';
import { ChatMessage, ChatResponse } from '../types/chatbot';

const API_URL = 'https://api.example.com/chatbot'; // Replace with your actual API URL

export const sendMessage = async (message: ChatMessage): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`${API_URL}/send`, message);
    return response.data;
  } catch (error) {
    throw new Error('Error sending message to the chatbot API');
  }
};

export const getBotResponse = async (userMessage: string): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`${API_URL}/response`, { message: userMessage });
    return response.data;
  } catch (error) {
    throw new Error('Error retrieving response from the chatbot API');
  }
};