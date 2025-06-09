// frontend/src/pages/chat/ChatPage.tsx
// صفحه اصلی چت

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  Tooltip
} from '@mui/material';

// Icons
import { 
  ChatBubbleOutline, 
  Add, 
  Menu as MenuIcon,
  DeleteOutline,
  Settings,
  ArrowBack,
  Tune
} from '@mui/icons-material';

// Components
import ChatInterface from '../../components/chat/ChatInterface';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Types
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageDate: Date;
  model: string;
}

// Mock data for conversation list
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'پرسش در مورد برنامه‌نویسی React',
    lastMessage: 'چگونه می‌توانم از Context API در React استفاده کنم؟',
    lastMessageDate: new Date(2023, 5, 12),
    model: 'gemini-pro'
  },
  {
    id: 'conv-2',
    title: 'ایده‌های طراحی وب‌سایت',
    lastMessage: 'لطفاً چند ایده برای طراحی وب‌سایت شرکتی به من بده',
    lastMessageDate: new Date(2023, 5, 15),
    model: 'gemini-pro'
  },
  {
    id: 'conv-3',
    title: 'ترجمه متن',
    lastMessage: 'می‌توانی این متن را به انگلیسی ترجمه کنی؟',
    lastMessageDate: new Date(2023, 5, 18),
    model: 'gemini-pro'
  }
];

// Chat Page Component
const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  
  // State
  const [drawerOpen, setDrawerOpen] = useState<boolean>(window.innerWidth > 1024);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  
  // Settings state
  const [modelSettings, setModelSettings] = useState({
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: ''
  });

  // Load conversation data
  useEffect(() => {
    const loadConversation = async () => {
      setIsLoading(true);
      try {
        // If we have a conversation ID, find it in our list
        if (conversationId) {
          const conversation = conversations.find(conv => conv.id === conversationId);
          setCurrentConversation(conversation || null);
        } else {
          // If no conversation ID, create a new conversation
          setCurrentConversation(null);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, conversations]);

  // Handle window resize for responsive drawer
  useEffect(() => {
    const handleResize = () => {
      setDrawerOpen(window.innerWidth > 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Create a new conversation
  const handleNewConversation = () => {
    navigate('/chat');
  };

  // Select a conversation
  const handleSelectConversation = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
    if (window.innerWidth < 1024) {
      setDrawerOpen(false);
    }
  };

  // Send a message
  const handleSendMessage = async (message: string) => {
    // This is a placeholder, in real app it would call the API
    console.log('Sending message:', message);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return Promise.resolve();
  };

  // Delete a conversation
  const handleDeleteConversation = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (currentConversation) {
      setConversations(prev => prev.filter(conv => conv.id !== currentConversation.id));
      navigate('/chat');
    }
    setDeleteDialogOpen(false);
  };

  // Open settings
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  // Save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to the API
    console.log('Saving settings:', modelSettings);
    setSettingsOpen(false);
  };

  // Handle settings changes
  const handleModelChange = (e: SelectChangeEvent<string>) => {
    setModelSettings(prev => ({ ...prev, model: e.target.value }));
  };

  const handleTemperatureChange = (_: Event, value: number | number[]) => {
    setModelSettings(prev => ({ ...prev, temperature: value as number }));
  };

  const handleMaxTokensChange = (_: Event, value: number | number[]) => {
    setModelSettings(prev => ({ ...prev, maxTokens: value as number }));
  };

  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelSettings(prev => ({ ...prev, systemPrompt: e.target.value }));
  };

  // Format conversation date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" text="در حال بارگذاری مکالمه..." />
      </Box>
    );
  }

  return (
    <Box className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar / Drawer for conversations list */}
      <Drawer
        variant={window.innerWidth > 1024 ? "persistent" : "temporary"}
        open={drawerOpen}
        onClose={toggleDrawer}
        className="w-72 flex-shrink-0"
        classes={{
          paper: "w-72 border-r border-gray-200 dark:border-gray-700"
        }}
      >
        <Box className="p-4 bg-white dark:bg-gray-800 h-full flex flex-col">
          <Box className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="font-bold text-gray-900 dark:text-white">
              مکالمات
            </Typography>
            <IconButton onClick={toggleDrawer} className="lg:hidden">
              <ArrowBack />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            className="mb-4 bg-indigo-600 hover:bg-indigo-700"
            onClick={handleNewConversation}
            fullWidth
          >
            گفتگوی جدید
          </Button>

          <Divider className="mb-4" />

          <List className="overflow-y-auto flex-grow">
            {conversations.map((conversation) => (
              <ListItem 
                key={conversation.id} 
                disablePadding 
                className="mb-1"
              >
                <ListItemButton 
                  selected={conversation.id === conversationId}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ListItemIcon>
                    <ChatBubbleOutline className="text-gray-500" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={conversation.title}
                    secondary={formatDate(conversation.lastMessageDate)}
                    primaryTypographyProps={{
                      className: "font-medium text-gray-900 dark:text-white truncate"
                    }}
                    secondaryTypographyProps={{
                      className: "text-gray-500 dark:text-gray-400 text-xs"
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box className="flex-grow flex flex-col h-full">
        {/* Top bar */}
        <Box className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <IconButton onClick={toggleDrawer} className="mr-2">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className="font-bold text-gray-900 dark:text-white flex-grow">
            Gemini Pro Studio
          </Typography>
          <Tooltip title="تنظیمات مدل" placement="bottom">
            <IconButton onClick={handleOpenSettings}>
              <Tune />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Chat interface */}
        <Box className="flex-grow p-4 overflow-hidden">
          <ChatInterface
            conversationId={conversationId}
            title={currentConversation?.title || 'گفتگوی جدید'}
            modelName={currentConversation?.model || 'Gemini Pro'}
            onSendMessage={handleSendMessage}
            onDeleteConversation={handleDeleteConversation}
            onExportConversation={() => console.log('Export conversation')}
            onCopyConversation={() => console.log('Copy conversation')}
            onChangeSettings={handleOpenSettings}
            isNewChat={!currentConversation}
          />
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="font-bold">تنظیمات مدل</DialogTitle>
        <DialogContent className="space-y-4">
          <FormControl fullWidth className="mt-4">
            <InputLabel id="model-select-label">مدل</InputLabel>
            <Select
              labelId="model-select-label"
              value={modelSettings.model}
              label="مدل"
              onChange={handleModelChange}
            >
              <MenuItem value="gemini-pro">Gemini Pro</MenuItem>
              <MenuItem value="gemini-pro-vision">Gemini Pro Vision</MenuItem>
            </Select>
          </FormControl>

          <Box className="mt-4">
            <Typography gutterBottom>دمای مدل: {modelSettings.temperature}</Typography>
            <Slider
              value={modelSettings.temperature}
              onChange={handleTemperatureChange}
              step={0.1}
              marks
              min={0}
              max={1}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" className="text-gray-500">
              مقادیر پایین‌تر پاسخ‌های دقیق‌تر و مقادیر بالاتر پاسخ‌های خلاقانه‌تر تولید می‌کنند.
            </Typography>
          </Box>

          <Box className="mt-4">
            <Typography gutterBottom>حداکثر توکن: {modelSettings.maxTokens}</Typography>
            <Slider
              value={modelSettings.maxTokens}
              onChange={handleMaxTokensChange}
              step={100}
              marks
              min={100}
              max={4000}
              valueLabelDisplay="auto"
            />
          </Box>

          <TextField
            label="پرامپت سیستمی"
            multiline
            rows={4}
            value={modelSettings.systemPrompt}
            onChange={handleSystemPromptChange}
            fullWidth
            className="mt-4"
            placeholder="دستورالعمل‌های خاص برای مدل..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>انصراف</Button>
          <Button 
            onClick={handleSaveSettings} 
            variant="contained"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            ذخیره تنظیمات
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle className="text-red-600">حذف گفتگو</DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف این گفتگو اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>انصراف</Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            className="bg-red-600 hover:bg-red-700"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatPage; 