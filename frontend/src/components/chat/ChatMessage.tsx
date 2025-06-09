// frontend/src/components/chat/ChatMessage.tsx
// کامپوننت پیام چت

import React from 'react';
import { Avatar } from '@mui/material';
import ReactMarkdown from 'react-markdown';

export interface MessageProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isTyping?: boolean;
}

const ChatMessage: React.FC<MessageProps> = ({
  content,
  role,
  timestamp,
  isTyping = false
}) => {
  const isUser = role === 'user';
  
  // نمایش زمان پیام
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* آواتار */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">ش</span>
            </div>
          ) : (
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">G</span>
            </div>
          )}
        </div>

        {/* محتوای پیام */}
        <div className={`mx-2 px-4 py-3 rounded-lg ${
          isUser 
            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-gray-800 dark:text-gray-200' 
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
        }`}>
          {isTyping ? (
            <div className="flex space-x-2 space-x-reverse">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
          <div className={`text-xs mt-1 text-gray-500 ${isUser ? 'text-left' : 'text-right'}`}>
            {formatTime(timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 