import React from 'react';
import { MessageCircle, User, ExternalLink } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/chatbot';
import { Link } from 'react-router-dom';

interface ChatMessageProps {
  message: ChatMessageType;
  onNavigate?: (url: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onNavigate }) => {
  const isBot = message.sender === 'bot';

  // Map URLs to friendly page names
  const pageNames: Record<string, string> = {
    '/vehicle': 'Browse Vehicles',
    '/customer/my-bookings': 'My Bookings',
    '/dashboard': 'Dashboard',
    '/customer/support': 'Support Center',
    '/Vehicles': 'List My Vehicle',
    '/admin/reports': 'Admin Dashboard'
  };

  return (
    <div className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-blue-600" />
        </div>
      )}

      <div className={`max-w-xs px-3 py-2 rounded-lg ${
        isBot 
          ? 'bg-gray-100 text-gray-800' 
          : 'bg-blue-600 text-white'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {/* If navigationUrl exists, show a clickable link with friendly name */}
        {isBot && message.navigationUrl && (
          <Link
            to={message.navigationUrl}
            className="mt-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {pageNames[message.navigationUrl] || message.navigationUrl}
          </Link>
        )}

        <p className={`text-xs mt-1 ${
          isBot ? 'text-gray-500' : 'text-blue-100'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;