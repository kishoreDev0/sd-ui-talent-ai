import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError, clearOnboardingRequired } from '@/store/slices/authentication/login';
import { loginUser } from '@/store/action/authentication/login';
import { useToast } from '@/components/ui/toast';
import Loader from '../loader/loader';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OnboardingStepper } from '../onboarding/onboarding-stepper';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSelector } from '@/components/ui/language-selector';
import TalentEdgeLogo from '@/components/logo/talentedge-logo';

interface LoginProps {
  leftSideImage?: string;
}

const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z
    .string()
    .min(1, t('login.emailRequired'))
    .email(t('login.emailInvalid')),
  password: z
    .string()
    .min(1, t('login.passwordRequired'))
    .min(6, t('login.passwordMinLength')),
});

const Login: React.FC<LoginProps> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { isLoading, error, is_onboarding_required, user } = useAppSelector(
    (state) => state.auth,
  );

  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = createLoginSchema(t);

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
        showToast(t('login.success'), 'success');
        // Clear form
        reset();
        // If onboarding is required, the stepper will be shown automatically
        // If not, navigate to dashboard
        if (!result.is_onboarding_required) {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login failed', err);
      // Show error toast
      const errorMessage = err?.message || err?.error || t('login.failed');
      showToast(errorMessage, 'error');
    }
  };

  const handleOnboardingComplete = () => {
    dispatch(clearOnboardingRequired());
    navigate('/dashboard');
  };

  // Show onboarding stepper if required
  if (is_onboarding_required && user?.id) {
    return <OnboardingStepper userId={user.id} onComplete={handleOnboardingComplete} />;
  }


  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-sky-100/60 via-blue-50/30 to-white">
        {/* Upper left - blue */}
        <div className="absolute top-0 left-0 w-2/5 h-2/5 bg-gradient-to-br from-blue-100/50 via-sky-100/40 to-transparent" />
        {/* Upper right - purple/lavender blend */}
        <div className="absolute top-0 right-0 w-2/5 h-2/5 bg-gradient-to-bl from-purple-100/40 via-violet-100/35 to-transparent" />
        {/* Center blend */}
        <div className="absolute top-1/4 right-1/4 w-2/5 h-2/5 bg-gradient-to-br from-indigo-100/30 via-purple-100/25 to-blue-100/30 rounded-full blur-3xl" />
      </div>
      
      {isLoading && <Loader />}

      {/* Top Logo - Left Corner */}
      <div className="relative z-20 flex justify-start pl-6 lg:pl-8 pt-6 lg:pt-8">
        <TalentEdgeLogo showText={true} iconSize="md" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative z-10">

      {/* Left Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {t('marketing.title')}
          </h1>
          <p className="text-lg text-gray-700 mt-4 font-medium">
            {t('marketing.description')}
          </p>
          <p className="text-base text-gray-600 mt-3">
            {t('marketing.subtitle')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 text-sm">
          {/* Language Selector */}
          <LanguageSelector />
        </div>
      </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-hidden relative z-10">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {t('login.title')}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {t('login.subtitle')}
            </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFormSubmit(onSubmit)(e);
            }}
            className="space-y-4"
            noValidate
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t('login.emailPlaceholder')}
                className={`w-full px-2.5 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={t('login.passwordPlaceholder')}
                  className={`w-full px-2.5 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-8 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Password */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-gray-700">
                {t('login.remember')}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isSubmitting ? t('login.signing') : t('login.button')}
            </button>
          </form>

            {/* Sign up link */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-600">
                {t('login.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/registerform')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('login.signUp')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
