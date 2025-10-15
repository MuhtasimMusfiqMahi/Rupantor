import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getSupabaseClient } from '../utils/supabase-client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from 'figma:asset/30413506c2fe0151b8e7a901d4930f79e5e6f227.png';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'public'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        if (data.session) {
          localStorage.setItem('access_token', data.session.access_token);
          onAuthSuccess();
        }
      } else {
        // Sign up
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/signup`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }

        // Auto sign in after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        
        if (signInData.session) {
          localStorage.setItem('access_token', signInData.session.access_token);
          onAuthSuccess();
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = error.message || 'Authentication failed';
      
      // Provide helpful context for invalid credentials
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials or sign up to create a new account.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src={logoImage} alt="রুপান্তর" className="h-28 w-auto mx-auto mb-6 drop-shadow-lg rounded-3xl" />
          <p className="text-xl text-gray-600 mb-2">
            {isLogin ? 'Welcome back!' : 'Join our climate action movement'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition-colors text-center ${
                isLogin ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition-colors text-center ${
                !isLogin ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="role">I want to join as</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="public">Public Member</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Administrative Committee</option>
                </select>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>

          {isLogin && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-2">💡 Getting Started</p>
              <div className="text-xs text-amber-700 space-y-2">
                <p>
                  <strong>New user?</strong> Click "Sign up" above to create your account.
                </p>
                <p>
                  Choose your role:
                </p>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>Public Member</strong> - View and register for events</li>
                  <li>• <strong>Volunteer</strong> - Receive tasks and participate</li>
                  <li>• <strong>Admin</strong> - Manage events and volunteers</li>
                </ul>
                <p className="text-amber-600 mt-2 italic">
                  After signing up, admins can generate sample data for testing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
