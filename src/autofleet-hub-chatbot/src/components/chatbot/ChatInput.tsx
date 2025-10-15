import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useChatBot } from '../../hooks/useChatBot';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChatBot();

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
};

export default ChatInput;