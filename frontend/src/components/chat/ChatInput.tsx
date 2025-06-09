// frontend/src/components/chat/ChatInput.tsx
// کامپوننت ورودی چت

import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendFile?: (file: File) => void;
  onStartRecording?: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendFile,
  onStartRecording,
  isLoading = false,
  placeholder = 'پیام خود را بنویسید...'
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تنظیم ارتفاع textarea بر اساس محتوا
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // ارسال پیام با کلید Enter (بدون Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ارسال پیام
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // تنظیم مجدد ارتفاع textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // باز کردن دیالوگ انتخاب فایل
  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // پردازش فایل انتخاب شده
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendFile) {
      onSendFile(file);
      // پاک کردن مقدار input برای امکان انتخاب مجدد همان فایل
      e.target.value = '';
    }
  };

  // شروع/پایان ضبط صدا
  const handleRecordClick = () => {
    if (isRecording) {
      setIsRecording(false);
      // پایان ضبط - این بخش باید پیاده‌سازی شود
    } else {
      setIsRecording(true);
      if (onStartRecording) {
        onStartRecording();
      }
    }
  };

  return (
    <div className="relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full px-4 py-3 pr-4 pl-16 max-h-[150px] min-h-[50px] text-gray-700 dark:text-gray-200 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none"
        dir="rtl"
      />
      
      <div className="absolute bottom-1 left-1 flex items-center space-x-1 space-x-reverse">
        <Tooltip title="ارسال پیام" placement="top">
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            color="primary"
            size="small"
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        {onSendFile && (
          <Tooltip title="پیوست فایل" placement="top">
            <IconButton
              onClick={handleAttachClick}
              disabled={isLoading}
              color="default"
              size="small"
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {onStartRecording && (
          <Tooltip title={isRecording ? "پایان ضبط" : "ضبط صدا"} placement="top">
            <IconButton
              onClick={handleRecordClick}
              color={isRecording ? "error" : "default"}
              size="small"
            >
              {isRecording ? <CloseIcon fontSize="small" /> : <MicIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </div>
      
      {/* Input مخفی برای انتخاب فایل */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};

export default ChatInput; 