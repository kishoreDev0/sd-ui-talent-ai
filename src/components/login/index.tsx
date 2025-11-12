import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError } from '@/store/slices/authentication/login';
import { loginUser } from '@/store/action/authentication/login';
import { forgotPassword } from '@/store/action/authentication/forgotPassword';
import { useToast } from '@/components/ui/toast';
import Loader from '../loader/loader';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSelector } from '@/components/ui/language-selector';
import TalentEdgeLogo from '@/components/logo/talentedge-logo';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface LoginProps {
  leftSideImage?: string;
}

const createLoginSchema = (
  translate: (key: string, fallback: string) => string,
) =>
  z.object({
    email: z
      .string()
      .min(1, translate('login.emailRequired', 'Email is required'))
      .email(translate('login.emailInvalid', 'Please enter a valid email')),
    password: z
      .string()
      .min(1, translate('login.passwordRequired', 'Password is required'))
      .min(
        6,
        translate(
          'login.passwordMinLength',
          'Password must be at least 6 characters',
        ),
      ),
  });

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'object') {
    const errRecord = error as Record<string, unknown>;
    const direct = errRecord.error;
    const message = errRecord.message;
    const responseData = (errRecord.response as Record<string, unknown>)
      ?.data as Record<string, unknown> | undefined;

    if (typeof direct === 'string') {
      return direct;
    }

    if (Array.isArray(direct) && direct.length > 0) {
      return direct
        .filter((item): item is string => typeof item === 'string')
        .join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }

    if (responseData) {
      const responseError = responseData.error;
      const responseMessage = responseData.message;

      if (typeof responseError === 'string') {
        return responseError;
      }

      if (Array.isArray(responseError) && responseError.length > 0) {
        return responseError
          .filter((item): item is string => typeof item === 'string')
          .join(', ');
      }

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }
    }
  }

  return fallback;
};

const Login: React.FC<LoginProps> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const translate = (key: string, fallback: string): string => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };
  const { httpClient } = initializeHttpClient();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { isLoading: isForgotLoading, error: forgotError } = useAppSelector(
    (state) => state.forgotPassword,
  );

  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Spring animation for mouse position
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    mouseX.set(mousePosition.x);
    mouseY.set(mousePosition.y);
  }, [mousePosition, mouseX, mouseY]);

  const loginSchema = createLoginSchema(translate);

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, translate('login.emailRequired', 'Email is required'))
      .email(translate('login.emailInvalid', 'Please enter a valid email')),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isSubmitting: forgotSubmitting },
    reset: resetForgotForm,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(
        loginUser({
          email: data.email,
          password: data.password,
          api: httpClient,
        }),
      ).unwrap();

      if (result) {
        if (rememberPassword) {
          localStorage.setItem('rememberMe', 'true');
        }
        // Show success toast
        showToast(
          translate('login.success', 'Signed in successfully!'),
          'success',
        );
        // Clear form
        reset();
        // Navigate to dashboard using replace to avoid reload
        requestAnimationFrame(() => {
          navigate('/dashboard', { replace: true });
        });
      }
    } catch (err) {
      console.error('Login failed', err);
      const errorMessage = extractErrorMessage(
        err,
        translate('login.failed', 'Login failed'),
      );
      showToast(errorMessage, 'error');
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await dispatch(
        forgotPassword({
          forgotPayload: { email: data.email },
          api: httpClient,
        }),
      ).unwrap();
      showToast(
        translate(
          'login.resetEmailSent',
          'Reset link sent! Please check your email.',
        ),
        'success',
      );
      resetForgotForm();
      setShowForgotPassword(false);
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        translate('login.resetEmailFailed', 'Unable to send reset link.'),
      );
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-white flex flex-col relative"
    >
      {/* Interactive Mouse-Following Spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            [smoothX, smoothY],
            ([x, y]: number[]) =>
              `radial-gradient(circle at ${x * 100}% ${y * 100}%}, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          ),
        }}
      />

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-sky-100/60 via-blue-50/30 to-white">
        {/* Upper left - blue */}
        <motion.div
          className="absolute top-0 left-0 w-2/5 h-2/5 bg-gradient-to-br from-blue-100/50 via-sky-100/40 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Upper right - purple/lavender blend */}
        <motion.div
          className="absolute top-0 right-0 w-2/5 h-2/5 bg-gradient-to-bl from-purple-100/40 via-violet-100/35 to-transparent"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        {/* Center blend */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-2/5 h-2/5 bg-gradient-to-br from-indigo-100/30 via-purple-100/25 to-blue-100/30 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200/40 rounded-full blur-sm"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {isLoading && <Loader />}

      {/* Top Logo - Left Corner */}
      <motion.div
        className="relative z-20 flex justify-start pl-6 lg:pl-8 pt-6 lg:pt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <TalentEdgeLogo showText={true} iconSize="md" />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex relative z-10">
        {/* Left Side - Marketing Content */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-8 h-8 text-blue-600" />
              </motion.div>
              <motion.h1
                className="text-4xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              >
                {t('marketing.title')}
              </motion.h1>
            </motion.div>
            <motion.p
              className="text-lg text-gray-700 mt-4 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            >
              {t('marketing.description')}
            </motion.p>
            <motion.p
              className="text-base text-gray-600 mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            >
              {t('marketing.subtitle')}
            </motion.p>
            <motion.p
              className="text-base text-gray-600 mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            >
              {t('marketing.tagline')}
            </motion.p>

            {/* Interactive Feature Cards */}
            <motion.div
              className="mt-8 grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { icon: Shield, text: 'Secure', color: 'blue' },
                { icon: Zap, text: 'Fast', color: 'yellow' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 cursor-pointer"
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                >
                  <feature.icon
                    className={`w-6 h-6 mb-2 ${
                      feature.color === 'blue'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}
                  />
                  <p className="text-sm font-medium text-gray-700">
                    {feature.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            className="flex items-center gap-6 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          >
            {/* Language Selector */}
            <LanguageSelector />
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-hidden relative z-10">
          <motion.div
            className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {translate('login.title', 'Sign In')}
            </motion.h2>
            <motion.p
              className="text-sm text-gray-600 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {translate('login.subtitle', 'Welcome back to your account')}
            </motion.p>

            {showForgotPassword ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleForgotSubmit(onForgotSubmit)(e);
                  return false;
                }}
                className="space-y-4"
                noValidate
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {translate('login.email', 'Email')}
                  </label>
                  <div className="relative">
                    <motion.input
                      id="forgot-email"
                      type="email"
                      {...registerForgot('email')}
                      placeholder={translate(
                        'login.emailPlaceholder',
                        'Enter your email',
                      )}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                      }}
                      className={`w-full px-2.5 py-2 pl-9 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        forgotErrors.email
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    <motion.div
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      animate={{
                        scale: forgotErrors.email ? [1, 1.2, 1] : 1,
                        color: forgotErrors.email ? '#ef4444' : '#9ca3af',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mail className="w-4 h-4" />
                    </motion.div>
                  </div>
                  {forgotErrors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-red-600 flex items-center gap-1"
                    >
                      <span>⚠</span>
                      {forgotErrors.email.message}
                    </motion.p>
                  )}
                </motion.div>

                {forgotError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs"
                  >
                    {typeof forgotError === 'string'
                      ? forgotError
                      : translate('login.resetEmailFailed', 'Reset failed')}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isForgotLoading || forgotSubmitting}
                  whileHover={{
                    scale: isForgotLoading || forgotSubmitting ? 1 : 1.02,
                    boxShadow:
                      isForgotLoading || forgotSubmitting
                        ? 'none'
                        : '0 10px 25px rgba(59, 130, 246, 0.3)',
                  }}
                  whileTap={{
                    scale: isForgotLoading || forgotSubmitting ? 1 : 0.98,
                  }}
                  className="relative w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isForgotLoading || forgotSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        {translate('login.sending', 'Sending...')}
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                        {translate('login.sendReset', 'Send reset link')}
                      </>
                    )}
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    resetForgotForm();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {translate('login.backToSignIn', 'Back to sign in')}
                </motion.button>
              </form>
            ) : (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFormSubmit(onSubmit)(e);
                    return false;
                  }}
                  className="space-y-4"
                  noValidate
                >
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {translate('login.email', 'Email')}
                    </label>
                    <div className="relative">
                      <motion.input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder={translate(
                          'login.emailPlaceholder',
                          'Enter your email',
                        )}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleFormSubmit(onSubmit)();
                          }
                        }}
                        whileFocus={{
                          scale: 1.02,
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        }}
                        className={`w-full px-2.5 py-2 pl-9 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                          errors.email
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <motion.div
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        animate={{
                          scale: errors.email ? [1, 1.2, 1] : 1,
                          color: errors.email ? '#ef4444' : '#9ca3af',
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Mail className="w-4 h-4" />
                      </motion.div>
                      {!errors.email && (
                        <motion.div
                          className="absolute right-2.5 top-1/2 -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 flex items-center gap-1"
                      >
                        <span>⚠</span>
                        {errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {translate('login.password', 'Password')}
                    </label>
                    <div className="relative">
                      <motion.input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder={translate(
                          'login.passwordPlaceholder',
                          'Enter your password',
                        )}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleFormSubmit(onSubmit)();
                          }
                        }}
                        whileFocus={{
                          scale: 1.02,
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        }}
                        className={`w-full px-2.5 py-2 pl-9 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-8 ${
                          errors.password
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <motion.div
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        animate={{
                          scale: errors.password ? [1, 1.2, 1] : 1,
                          color: errors.password ? '#ef4444' : '#9ca3af',
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Lock className="w-4 h-4" />
                      </motion.div>
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                        animate={{
                          color: showPassword ? '#2563eb' : '#9ca3af',
                        }}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 flex items-center gap-1"
                      >
                        <span>⚠</span>
                        {errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Remember Password & Forgot */}
                  <motion.div
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div
                      className="flex items-center cursor-pointer group"
                      onClick={() => setRememberPassword(!rememberPassword)}
                    >
                      <motion.div
                        className="relative w-4 h-4 border-2 rounded transition-colors"
                        animate={{
                          borderColor: rememberPassword ? '#2563eb' : '#d1d5db',
                          backgroundColor: rememberPassword
                            ? '#2563eb'
                            : 'transparent',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {rememberPassword && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                      <label
                        htmlFor="remember"
                        className="ml-2 text-xs text-gray-700 cursor-pointer group-hover:text-blue-600 transition-colors"
                      >
                        {translate('login.remember', 'Remember me')}
                      </label>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => {
                        resetForgotForm();
                        setShowForgotPassword(true);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 text-left"
                    >
                      {translate('login.forgotPassword', 'Forgot password?')}
                    </motion.button>
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Sign In Button */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      handleFormSubmit(onSubmit)();
                    }}
                    disabled={isLoading || isSubmitting}
                    whileHover={{
                      scale: isLoading || isSubmitting ? 1 : 1.02,
                      boxShadow:
                        isLoading || isSubmitting
                          ? 'none'
                          : '0 10px 25px rgba(59, 130, 246, 0.3)',
                    }}
                    whileTap={{ scale: isLoading || isSubmitting ? 1 : 0.98 }}
                    className="relative w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading || isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          {translate('login.signing', 'Signing in...')}
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.div>
                          {translate('login.button', 'Sign In')}
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>

                {/* Sign up link */}
                <motion.div
                  className="text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <p className="text-xs text-gray-600">
                    {translate('login.noAccount', "Don't have an account?")}{' '}
                    <motion.button
                      type="button"
                      onClick={() => navigate('/registerform')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {translate('login.signUp', 'Sign up')}
                    </motion.button>
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
