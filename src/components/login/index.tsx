import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError } from '@/store/slices/authentication/login';
import { loginUser } from '@/store/action/authentication/login';
import Loader from '../loader/loader';
import { Search, Settings, Folder, User, Eye, EyeOff } from 'lucide-react';
import TalentEdgeLogo from '@/components/logo/talentedge-logo';

interface LoginProps {
  leftSideImage?: string; // Image for the left side
}

const Login: React.FC<LoginProps> = ({ leftSideImage }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleForgotPassword = () => {
    navigate('/forgotpassword');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        loginUser({
          email,
          password,
          api: httpClient,
        }),
      ).unwrap();

      if (result) {
        if (rememberPassword) {
          localStorage.setItem('rememberMe', 'true');
        }
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed', err);
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
            <div className="w-auto bg-white rounded-lg flex items-center justify-center shadow-lg px-3 py-2">
              <TalentEdgeLogo showText={true} iconSize="sm" />
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4 max-w-lg flex-shrink-0">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Designed for Individuals
            </h1>
            <p className="text-lg lg:text-xl text-blue-100">
              See the analytics and grow your data revenue, from anywhere!
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

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center bg-white px-6 sm:px-8 py-8 h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Login
          </h2>

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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset Password
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
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
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember Password
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'LOGIN'}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/registerform')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
