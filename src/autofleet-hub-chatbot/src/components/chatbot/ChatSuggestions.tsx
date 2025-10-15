import React from 'react';

interface ChatSuggestion {
  id: number;
  text: string;
}

interface ChatSuggestionsProps {
  suggestions: ChatSuggestion[];
  onSuggestionClick: (suggestion: ChatSuggestion) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="chat-suggestions">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          className="suggestion-button"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;