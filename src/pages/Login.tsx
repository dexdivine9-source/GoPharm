import React, { useState } from 'react';
import { useSupabase } from '../lib/mock-db';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle } from 'lucide-react';
import SocialButtons from '../components/auth/SocialButtons';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState(''); // Dummy password field for UI completeness
  const [error, setError] = useState<string | null>(null);
  
  const { login, allProfiles } = useSupabase();
  const navigate = useNavigate();

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mock Duplicate checking logic
    const existingUser = allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (isSignUp) {
      if (!fullName) {
        setError("Full Name is required for registration.");
        return;
      }
      if (existingUser) {
        setError("An account with this email already exists. Try signing in or use a social provider to link your identity.");
        return;
      }
    } else {
      if (!existingUser) {
        setError("Account not found. Please sign up first.");
        return;
      }
    }

    // Default mock behavior
    login(email, fullName || existingUser?.full_name || 'Pharmacist Demo');
    // We navigate to dashboard as a placeholder.
    // The `<ProtectedRoute>` or `<PublicOnlyRoute>` wrapper immediately intercepts and redirects 
    // verified/unverified users to their correct spots, and App.tsx renders RoleModal for newbies.
    navigate('/'); 
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setError(null);
    let mockEmail = '';
    let mockName = '';

    if (provider === 'google') {
      mockEmail = 'user-google@example.com';
      mockName = 'Google Social User';
    } else {
      mockEmail = 'user-apple@example.com';
      mockName = 'Apple Social User';
    }

    login(mockEmail, mockName);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Activity className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Join Pharma-E' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? 'Create your account to access the network' : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md border-t-4 border-emerald-600 rounded-lg shadow-xl overflow-hidden">
        <div className="bg-white py-8 px-4 sm:px-10">
          
          <SocialButtons onSocialLogin={handleSocialLogin} />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          <form className="space-y-6 mt-6" onSubmit={handleManualAuth}>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-start gap-2 border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSignUp && (
              <div>
                <label flex-auto="true" htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                    placeholder="E.g. Dr. Jane Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-[0.98]"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="font-medium text-emerald-600 hover:text-emerald-500 text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
