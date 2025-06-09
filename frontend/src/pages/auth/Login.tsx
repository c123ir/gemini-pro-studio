// frontend/src/pages/auth/Login.tsx
// Login Page Component
// Path: frontend/src/pages/auth/Login.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Material-UI Components
import {
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';

// Icons
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  ArrowBack,
} from '@mui/icons-material';

// Store and Services
import { useAuthStore } from '../../store/authStore';
import type { LoginCredentials } from '../../store/authStore';

// Components
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LoadingButton from '../../components/ui/LoadingButton';

// Animation variants
const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { opacity: 0, y: -20 }
};

const formVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, delay: 0.2 }
  }
};

// Form validation rules
const validationRules = {
  email: {
    required: 'ایمیل الزامی است',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'فرمت ایمیل صحیح نیست'
    }
  },
  password: {
    required: 'رمز عبور الزامی است',
    minLength: {
      value: 6,
      message: 'رمز عبور باید حداقل ۶ کاراکتر باشد'
    }
  }
};

// Login Page Component
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated } = useAuthStore();

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<LoginCredentials>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  // Watch form values
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered-email');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setRememberMe(true);
      trigger('email');
    }
  }, [setValue, trigger]);

  // Handle form submission
  const onSubmit = async (data: LoginCredentials) => {
    try {
      // Save email if remember me is checked
      if (data.rememberMe) {
        localStorage.setItem('remembered-email', data.email);
      } else {
        localStorage.removeItem('remembered-email');
      }

      await login(data);
      
      // Navigate to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      
    } catch (error: any) {
      console.error('Login failed:', error);
      // Error is handled by the auth store
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      // TODO: Implement Google OAuth
      toast.error('ورود با گوگل هنوز پیاده‌سازی نشده است');
    } catch (error) {
      toast.error('خطا در ورود با گوگل');
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle demo login
  const handleDemoLogin = () => {
    setValue('email', 'test@example.com');
    setValue('password', '123456');
    setRememberMe(false);
    trigger(['email', 'password']);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-vazir">
            خوش آمدید
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 font-vazir">
            به حساب کاربری خود وارد شوید
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={formVariants}
          initial="initial"
          animate="animate"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
        >
          {/* Demo Login Alert */}
          <Alert 
            severity="info" 
            className="mb-6 font-vazir"
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleDemoLogin}
                className="font-vazir"
              >
                ورود آزمایشی
              </Button>
            }
          >
            برای تست سیستم می‌توانید از حساب آزمایشی استفاده کنید
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <TextField
                {...register('email', validationRules.email)}
                fullWidth
                label="ایمیل"
                type="email"
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="text-gray-400" />
                    </InputAdornment>
                  ),
                  className: 'font-vazir'
                }}
                InputLabelProps={{
                  className: 'font-vazir'
                }}
                className="font-vazir"
              />
            </div>

            {/* Password Field */}
            <div>
              <TextField
                {...register('password', validationRules.password)}
                fullWidth
                label="رمز عبور"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        disabled={isLoading}
                        size="small"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  className: 'font-vazir'
                }}
                InputLabelProps={{
                  className: 'font-vazir'
                }}
                className="font-vazir"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <FormControlLabel
                control={
                  <Checkbox
                    {...register('rememberMe')}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    color="primary"
                  />
                }
                label={
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-vazir">
                    مرا به خاطر بسپار
                  </span>
                }
              />

              <Link 
                to="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-800 font-vazir transition-colors"
              >
                فراموشی رمز عبور؟
              </Link>
            </div>

            {/* Login Button */}
            <LoadingButton
              isLoading={isLoading}
              disabled={!isValid || isLoading}
              onClick={handleSubmit(onSubmit)}
              variant="primary"
              size="large"
              className="w-full font-vazir text-lg py-3"
              text="ورود به سیستم"
            />
          </form>

          {/* Divider */}
          <div className="my-6">
            <Divider className="font-vazir">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-vazir">
                یا
              </span>
            </Divider>
          </div>

          {/* Google Login */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={isLoading}
            startIcon={<Google />}
            className="font-vazir py-3 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ورود با گوگل
          </Button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 font-vazir">
              حساب کاربری ندارید؟{' '}
              <Link 
                to="/auth/register"
                className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
              >
                ثبت‌نام کنید
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            className="text-gray-500 hover:text-gray-700 font-vazir"
          >
            بازگشت به صفحه اصلی
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;