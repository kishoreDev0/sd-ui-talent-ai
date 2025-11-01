import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { RootState } from '@/store/reducer';
import { forgotPassword } from '@/store/action/authentication/forgotPassword';
import { Snackbar } from '../snackbar';
import Loader from '../loader/loader';
import { Search, Settings, Folder, User } from 'lucide-react';

interface ForgotPasswordProps {
  logoSrc?: string;
  logoAlt?: string;
  leftSideImage?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  logoSrc,
  logoAlt = 'Company Logo',
  leftSideImage,
}) => {
  const navigate = useNavigate();
  const { httpClient } = initializeHttpClient();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(
    (state: RootState) => state.forgotPassword,
  );
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const [email, setEmail] = useState('');

  const handleBackToLogin = () => navigate('/login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await dispatch(
        forgotPassword({
          forgotPayload: {
            email,
          },
          api: httpClient,
        }),
      ).unwrap();
      if (response?.status === 'success') {
        setSnackbar({
          message: 'Password reset email sent! Please check your inbox.',
          type: 'success',
        });
        setTimeout(() => {
          handleBackToLogin();
        }, 3000);
      } else {
        setSnackbar({
          message: 'Email not found',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Forgot password failed', err);
      setSnackbar({
        message: 'Forgot password failed',
        type: 'error',
      });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {isLoading && <Loader />}

      {/* Left Side - Blue Background with Design */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden h-full">
        {/* Abstract Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-8 text-white h-full overflow-hidden">
          {/* Top Logo/Icon */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              {logoSrc ? (
                <img src={logoSrc} alt={logoAlt} className="w-7 h-7" />
              ) : (
                <Search className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4 max-w-lg flex-shrink-0">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Reset Your Password
            </h1>
            <p className="text-lg lg:text-xl text-blue-100">
              Don't worry, we'll help you get back into your account.
            </p>
          </div>

          {/* Embedded Application Window Mockup */}
          <div className="relative max-w-2xl w-full flex-shrink flex-grow min-h-0 overflow-hidden">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden h-full flex flex-col">
              {/* Window Header */}
              <div className="bg-gray-100 px-3 py-1.5 flex items-center justify-between border-b flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 font-medium">
                    Example File
                  </span>
                  <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                </div>
              </div>

              {/* Window Content */}
              <div className="flex flex-1 min-h-0">
                {/* Sidebar */}
                <div className="bg-gray-50 w-12 flex flex-col items-center py-3 gap-3 border-r flex-shrink-0">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Folder className="w-4 h-4 text-gray-400" />
                  <Settings className="w-4 h-4 text-gray-400" />
                  <User className="w-4 h-4 text-gray-400" />
                </div>

                {/* Spreadsheet Grid */}
                <div className="flex-1 p-3 overflow-auto">
                  <div className="grid grid-cols-6 gap-1.5 text-[10px]">
                    <div className="h-5 bg-gray-200 flex items-center justify-center font-semibold">
                      A
                    </div>
                    <div className="h-5 bg-gray-200 flex items-center justify-center font-semibold">
                      B
                    </div>
                    <div className="h-5 bg-gray-200 flex items-center justify-center font-semibold">
                      C
                    </div>
                    <div className="h-5 bg-gray-200 flex items-center justify-center font-semibold">
                      D
                    </div>
                    <div className="h-5 bg-gray-200 flex items-center justify-center font-semibold">
                      E
                    </div>
                    <div className="h-5 bg-gray-200 flex items-center justify-center font-semibold">
                      F
                    </div>

                    {[...Array(8)].map((_, i) => (
                      <React.Fragment key={i}>
                        <div className="h-3 bg-gray-100 border border-gray-200"></div>
                        <div className="h-3 bg-gray-100 border border-gray-200"></div>
                        <div className="h-3 bg-gray-100 border border-gray-200"></div>
                        <div className="h-3 bg-gray-100 border border-gray-200"></div>
                        <div className="h-3 bg-gray-100 border border-gray-200"></div>
                        <div className="h-3 bg-gray-100 border border-gray-200"></div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional: Replace with your image */}
            {leftSideImage && (
              <div className="absolute inset-0 -z-10">
                <img
                  src={leftSideImage}
                  alt="Background"
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
            )}
          </div>

          {/* Bottom Avatar */}
          <div className="absolute bottom-6 left-6 flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center bg-white px-6 sm:px-8 py-8 h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mail.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to login link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>

      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
