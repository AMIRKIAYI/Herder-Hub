// AccountMessages.tsx
import React from 'react';
import { FiUser, FiMessageSquare } from 'react-icons/fi';
import { Button } from './Button';
import { Message } from './types';

interface AccountMessagesProps {
  messages: Message[];
  onNewMessage: () => void;
}

export const AccountMessages: React.FC<AccountMessagesProps> = ({
  messages,
  onNewMessage
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Communicate with sellers</p>
        </div>
        <Button onClick={onNewMessage}>New Message</Button>
      </div>
      
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {messages.map(message => (
          <div key={message.id} className="border-b hover:bg-gray-50 px-4 py-3 cursor-pointer transition-colors">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {message.avatar ? (
                  <img src={message.avatar} alt={message.sender} className="h-full w-full object-cover" />
                ) : (
                  <FiUser className="text-gray-500 text-xl" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900 truncate">{message.sender}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {message.time || new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{message.preview || message.subject}</p>
              </div>
              {!message.read && (
                <span className="h-3 w-3 rounded-full bg-[#A52A2A] flex-shrink-0"></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};