import { useState, useEffect } from 'react';
import { getSupabaseClient } from './utils/supabase-client';
import { projectId } from './utils/supabase/info';
import { User } from './types';
import { PublicHome } from './components/PublicHome';
import { ContactUs } from './components/ContactUs';
import { Auth } from './components/Auth';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatSystem } from './components/ChatSystem';
import { EventsPage } from './components/EventsPage';
import { UserProfile } from './components/UserProfile';
import { Menu, X, LogOut, Home, Phone, MessageSquare, Calendar, LayoutDashboard } from 'lucide-react';
import logoImage from 'figma:asset/30413506c2fe0151b8e7a901d4930f79e5e6f227.png';

type Page = 'home' | 'contact' | 'auth' | 'volunteer' | 'admin' | 'chat' | 'events' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
    
    // Initialize page from URL hash or default to home
    const hash = window.location.hash.slice(1);
    const [pagePart, queryPart] = hash.split('?');
    const initialPage = pagePart as Page || 'home';
    
    if (initialPage) {
      setCurrentPage(initialPage);
      
      // Extract email parameter for profile page
      if (initialPage === 'profile' && queryPart) {
        const params = new URLSearchParams(queryPart);
        const email = params.get('email');
        if (email) {
          setProfileEmail(decodeURIComponent(email));
        }
      }
    }
    
    // Listen for browser back/forward button
    const handlePopState = (event: PopStateEvent) => {
      const hash = window.location.hash.slice(1);
      const [pagePart, queryPart] = hash.split('?');
      const page = event.state?.page || pagePart || 'home';
      setCurrentPage(page as Page);
      
      // Handle profile email from state or URL
      if (page === 'profile') {
        const email = event.state?.email || (queryPart ? new URLSearchParams(queryPart).get('email') : null);
        setProfileEmail(email ? decodeURIComponent(email) : null);
      } else {
        setProfileEmail(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const checkSession = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && session.access_token) {
        setAccessToken(session.access_token);
        localStorage.setItem('access_token', session.access_token);
        await fetchUserProfile(session.access_token);
      } else {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          setAccessToken(storedToken);
          await fetchUserProfile(storedToken);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleAuthSuccess = async () => {
    await checkSession();
    handleNavigate('home');
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    setUser(null);
    setAccessToken(null);
    handleNavigate('home');
  };

  const handleNavigate = (page: string, params?: { email?: string }) => {
    const newPage = page as Page;
    setCurrentPage(newPage);
    setMobileMenuOpen(false);
    
    // Handle profile navigation with email parameter
    if (newPage === 'profile' && params?.email) {
      setProfileEmail(params.email);
      window.history.pushState({ page: newPage, email: params.email }, '', `#${newPage}?email=${encodeURIComponent(params.email)}`);
    } else {
      setProfileEmail(null);
      window.history.pushState({ page: newPage }, '', `#${newPage}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <img src={logoImage} alt="রুপান্তর" className="h-40 w-auto mx-auto mb-8 animate-pulse drop-shadow-2xl rounded-3xl" />
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-6"></div>
          <p className="text-slate-600 text-lg">Loading রুপান্তর...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group"
            >
              <img src={logoImage} alt="রুপান্তর" className="h-14 w-auto group-hover:scale-105 transition-transform duration-300 rounded-2xl" />
              <div className="hidden sm:block">
                <p className="text-xs text-slate-500 font-medium">Climate Action Youth Organization</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => handleNavigate('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-center ${
                  currentPage === 'home'
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-5 h-5" />
                Home
              </button>
              
              <button
                onClick={() => handleNavigate('events')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-center ${
                  currentPage === 'events'
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Events
              </button>
              
              {user && (user.role === 'admin' || user.role === 'volunteer') && (
                <button
                  onClick={() => handleNavigate(user.role === 'admin' ? 'admin' : 'volunteer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-center ${
                    (currentPage === 'admin' || currentPage === 'volunteer')
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
              )}
              
              <button
                onClick={() => handleNavigate('contact')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-center ${
                  currentPage === 'contact'
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Phone className="w-5 h-5" />
                Contact
              </button>
              
              {user && (user.role === 'admin' || user.role === 'volunteer') && (
                <button
                  onClick={() => handleNavigate('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-center ${
                    currentPage === 'chat'
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-sm text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 text-center"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate('auth')}
                  className="ml-4 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium text-center"
                >
                  Login / Sign Up
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[rgb(78,190,114)] hover:bg-gray-100 rounded-lg text-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 bg-white/95 backdrop-blur-lg">
              <nav className="space-y-2 px-4">
                <button
                  onClick={() => {
                    handleNavigate('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-center ${
                    currentPage === 'home'
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  Home
                </button>
                
                <button
                  onClick={() => {
                    handleNavigate('events');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-center ${
                    currentPage === 'events'
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  Events
                </button>
                
                {user && (user.role === 'admin' || user.role === 'volunteer') && (
                  <button
                    onClick={() => {
                      handleNavigate(user.role === 'admin' ? 'admin' : 'volunteer');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-center ${
                      (currentPage === 'admin' || currentPage === 'volunteer')
                        ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleNavigate('contact');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-center ${
                    currentPage === 'contact'
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  Contact
                </button>
                
                {user && (user.role === 'admin' || user.role === 'volunteer') && (
                  <button
                    onClick={() => {
                      handleNavigate('chat');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-center ${
                      currentPage === 'chat'
                        ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat
                  </button>
                )}

                {user ? (
                  <>
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <p className="text-sm text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleNavigate('auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md"
                  >
                    Login / Sign Up
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <PublicHome onNavigate={handleNavigate} user={user} accessToken={accessToken} />
        )}
        {currentPage === 'events' && (
          <EventsPage user={user} accessToken={accessToken} />
        )}
        {currentPage === 'contact' && <ContactUs />}
        {currentPage === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}
        {currentPage === 'volunteer' && user && (
          <VolunteerDashboard user={user} accessToken={accessToken!} onNavigate={handleNavigate} />
        )}
        {currentPage === 'admin' && user && (
          <AdminDashboard user={user} accessToken={accessToken!} onNavigate={handleNavigate} />
        )}
        {currentPage === 'chat' && user && (
          <ChatSystem user={user} accessToken={accessToken!} onNavigate={handleNavigate} />
        )}
        {currentPage === 'profile' && profileEmail && (
          <UserProfile email={profileEmail} currentUser={user} accessToken={accessToken} onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white py-16 mt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img src={logoImage} alt="রুপান্তর" className="h-24 w-auto mx-auto mb-6 drop-shadow-lg rounded-3xl" />
            <p className="text-emerald-200 mb-8 text-lg font-light">Fighting Climate Change Together</p>
            <div className="flex justify-center gap-10 mb-8">
              <button onClick={() => handleNavigate('home')} className="text-emerald-300 hover:text-white transition-all duration-300 hover:scale-110">
                Home
              </button>
              <button onClick={() => handleNavigate('contact')} className="text-emerald-300 hover:text-white transition-all duration-300 hover:scale-110">
                Contact
              </button>
              {user && (user.role === 'admin' || user.role === 'volunteer') && (
                <button onClick={() => handleNavigate('chat')} className="text-emerald-300 hover:text-white transition-all duration-300 hover:scale-110">
                  Chat
                </button>
              )}
            </div>
            <div className="border-t border-emerald-800/30 pt-8">
              <p className="text-sm text-emerald-400/60">
                © 2025 Rupantor Climate Action Youth Organization. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
