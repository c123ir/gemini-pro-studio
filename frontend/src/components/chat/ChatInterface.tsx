// frontend/src/components/chat/ChatInterface.tsx
// کامپوننت اصلی رابط کاربری چت

import React, { useState, useEffect, useRef } from 'react';
import { Typography, Paper, IconButton, Tooltip, Divider, Menu, MenuItem } from '@mui/material';
import { MoreVert, Settings, Delete, Download, ContentCopy, Label, Send } from '@mui/icons-material';

// Components
import ChatMessage, { MessageProps } from './ChatMessage';
import ChatInput from './ChatInput';

// Types
interface ChatInterfaceProps {
  conversationId?: string;
  title?: string;
  modelName?: string;
  onSendMessage: (message: string) => Promise<void>;
  onDeleteConversation?: () => void;
  onExportConversation?: () => void;
  onCopyConversation?: () => void;
  onChangeSettings?: () => void;
  isNewChat?: boolean;
}

interface Message extends MessageProps {
  id: string;
}

// Chat Interface Component
const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  title = 'گفتگوی جدید',
  modelName = 'Gemini Pro',
  onSendMessage,
  onDeleteConversation,
  onExportConversation,
  onCopyConversation,
  onChangeSettings,
  isNewChat = true
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // اسکرول به آخرین پیام
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // اسکرول به پایین هنگام ارسال یا دریافت پیام جدید
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // نمایش پیام خوش‌آمدگویی در چت جدید
  useEffect(() => {
    if (isNewChat && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `سلام! من یک دستیار هوش مصنوعی قدرتمند هستم که با استفاده از Gemini Pro توسعه یافته‌ام. چطور می‌توانم امروز به شما کمک کنم؟`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isNewChat, messages.length]);
  
  // ارسال پیام جدید
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // افزودن پیام کاربر به لیست پیام‌ها
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // نمایش حالت در حال تایپ
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    setIsLoading(true);
    
    try {
      // ارسال درخواست به API
      await onSendMessage(content);
      
      // مدل سازی پاسخ AI - بعداً با پاسخ واقعی API جایگزین می‌شود
      const aiResponse = "این یک پاسخ نمونه است. در نسخه نهایی، این پاسخ با پاسخ واقعی از API جایگزین می‌شود.";
      
      // حذف پیام "در حال تایپ" و افزودن پاسخ واقعی
      setMessages(prev => 
        prev.filter(msg => !msg.isTyping).concat({
          id: `ai-${Date.now()}`,
          content: aiResponse,
          role: 'assistant',
          timestamp: new Date()
        })
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      // حذف پیام "در حال تایپ" و نمایش خطا
      setMessages(prev => 
        prev.filter(msg => !msg.isTyping).concat({
          id: `error-${Date.now()}`,
          content: 'متأسفانه در پردازش پیام شما خطایی رخ داد. لطفاً دوباره تلاش کنید.',
          role: 'assistant',
          timestamp: new Date()
        })
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // باز/بسته کردن منوی عملیات
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Paper 
      elevation={0} 
      className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white">
            {title}
          </Typography>
          <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
            مدل: {modelName}
          </Typography>
        </div>
        
        <div className="flex items-center">
          {onChangeSettings && (
            <Tooltip title="تنظیمات گفتگو" placement="top">
              <IconButton size="small" onClick={onChangeSettings}>
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="گزینه‌های بیشتر" placement="top">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          >
            {onExportConversation && (
              <MenuItem onClick={() => { handleMenuClose(); onExportConversation(); }}>
                <Download fontSize="small" className="ml-2" />
                دانلود گفتگو
              </MenuItem>
            )}
            
            {onCopyConversation && (
              <MenuItem onClick={() => { handleMenuClose(); onCopyConversation(); }}>
                <ContentCopy fontSize="small" className="ml-2" />
                کپی گفتگو
              </MenuItem>
            )}
            
            <MenuItem onClick={handleMenuClose}>
              <Label fontSize="small" className="ml-2" />
              افزودن برچسب
            </MenuItem>
            
            <Divider />
            
            {onDeleteConversation && (
              <MenuItem 
                onClick={() => { handleMenuClose(); onDeleteConversation(); }}
                className="text-red-600 hover:text-red-800"
              >
                <Delete fontSize="small" className="ml-2" />
                حذف گفتگو
              </MenuItem>
            )}
          </Menu>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            content={message.content}
            role={message.role}
            timestamp={message.timestamp}
            isTyping={message.isTyping}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendFile={(file) => console.log('File sent:', file)}
          onStartRecording={() => console.log('Recording started')}
          isLoading={isLoading}
          placeholder="پیام خود را بنویسید..."
        />
      </div>
    </Paper>
  );
};

export default ChatInterface; 