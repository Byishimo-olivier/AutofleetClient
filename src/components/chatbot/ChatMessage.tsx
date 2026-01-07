import React from 'react';
import { MessageCircle, User, ExternalLink, Globe2, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/chatbot';
import { Link } from 'react-router-dom';

interface ChatMessageProps {
  message: ChatMessageType & { suggestions?: string[] }; // <-- Add suggestions property
  onNavigate?: (url: string) => void;
  role?: string;
  language?: string;
  personalized?: boolean;
}

const roleColors: Record<string, string> = {
  Customer: 'bg-blue-100 text-blue-600',
  'Fleet Owner': 'bg-green-100 text-green-600',
  Admin: 'bg-purple-100 text-purple-600'
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onNavigate,
  role = 'Customer',
  language = 'English',
  personalized = false
}) => {
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

  // Message type styling
  const getMessageStyle = () => {
    if (isBot) {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-blue-600 text-white';
  };

  return (
    <div className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${roleColors[role] || 'bg-blue-100 text-blue-600'}`}>
          <MessageCircle className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-xs px-3 py-2 rounded-lg ${getMessageStyle()}`}>
        <div className="flex items-center gap-2 mb-1">
          {isBot && (
            <>
              <span className="text-xs flex items-center gap-1">
                <Globe2 className="w-3 h-3" /> {language}
              </span>
              {personalized && (
                <span className="text-xs flex items-center gap-1 ml-2 text-yellow-500">
                  <Sparkles className="w-3 h-3" /> Personalized
                </span>
              )}
            </>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Navigation link or button */}
        {isBot && message.navigationUrl && (
          onNavigate ? (
            <button
              onClick={() => {
                if (message.navigationUrl) {
                  onNavigate(message.navigationUrl);
                }
              }}
              className="mt-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {pageNames[message.navigationUrl] || message.navigationUrl}
            </button>
          ) : (
            <Link
              to={message.navigationUrl}
              className="mt-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {pageNames[message.navigationUrl] || message.navigationUrl}
            </Link>
          )
        )}

        {/* Suggestions for bot messages */}
        {isBot && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((s, idx) => (
              <span
                key={idx}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-300"
                title="Quick action"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <p className={`text-xs mt-1 ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
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