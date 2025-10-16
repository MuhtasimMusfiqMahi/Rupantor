import { useState, useEffect } from 'react';
import { getSupabaseClient, projectId } from './utils/supabase-config'; // <-- UPDATED IMPORT PATH AND EXPORTS
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

// Initialize Supabase Client (safe to call here as it pulls config from env)
const supabase = getSupabaseClient();

type Page = 'home' | 'contact' | 'auth' | 'volunteer' | 'admin' | 'chat' | 'events' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);

  // --- Utility Functions ---
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false); // Close menu on navigation
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setAccessToken(null);
      setCurrentPage('home');
      setMobileMenuOpen(false);
      console.log('Logged out successfully.');
    } catch (error) {
      console.error('Logout Error:', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (email: string) => {
    try {
      // NOTE: Using a hardcoded user role for testing purposes if RLS is not set up,
      // but the real implementation should query your 'profiles' table.
      const { data, error } = await supabase
        .from('profiles')
        .select(`id, email, role, full_name, avatar_url, contact_info, bio`)
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          role: data.role as 'user' | 'volunteer' | 'admin',
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          contact_info: data.contact_info,
          bio: data.bio
        });
      } else {
        // Fallback for new user or profile not found: treat as basic 'user'
        setUser({
          id: '',
          email,
          role: 'user',
          full_name: 'New User',
          avatar_url: '',
          contact_info: {},
          bio: ''
        });
      }

    } catch (error) {
      console.error('Error fetching user profile:', (error as Error).message);
      // Fallback in case of profile fetch failure
      setUser({
        id: '',
        email: email,
        role: 'user',
        full_name: 'User',
        avatar_url: '',
        contact_info: {},
        bio: ''
      });
    } finally {
      setLoading(false);
    }
  };
  
  // --- Authentication Effect ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      if (session) {
        setAccessToken(session.access_token);
        const email = session.user.email || 'unknown@example.com';
        setProfileEmail(email);
        await getUserProfile(email);
      } else {
        setUser(null);
        setAccessToken(null);
        setProfileEmail(null);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // --- Initial Page Navigation Effect ---
  useEffect(() => {
    if (!loading) {
      if (user) {
        switch (user.role) {
          case 'admin':
            setCurrentPage('admin');
            break;
          case 'volunteer':
            setCurrentPage('volunteer');
            break;
          default:
            setCurrentPage('home');
            break;
        }
      } else {
        setCurrentPage('home');
      }
    }
  }, [loading, user]);

  // --- Rendering Functions ---

  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-emerald-300">Loading user data...</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <PublicHome projectId={projectId} user={user} supabase={supabase} handleNavigate={handleNavigate} />;
      case 'contact':
        return <ContactUs projectId={projectId} user={user} supabase={supabase} />;
      case 'auth':
        return <Auth projectId={projectId} user={user} supabase={supabase} handleNavigate={handleNavigate} />;
      case 'volunteer':
        return user?.role === 'volunteer' || user?.role === 'admin' ? (
          <VolunteerDashboard projectId={projectId} user={user} supabase={supabase} handleNavigate={handleNavigate} />
        ) : (
          <p className="text-red-400 text-center py-10">Access Denied.</p>
        );
      case 'admin':
        return user?.role === 'admin' ? (
          <AdminDashboard projectId={projectId} user={user} supabase={supabase} handleNavigate={handleNavigate} />
        ) : (
          <p className="text-red-400 text-center py-10">Access Denied.</p>
        );
      case 'chat':
        return user ? (
          <ChatSystem projectId={projectId} user={user} supabase={supabase} />
        ) : (
          <p className="text-red-400 text-center py-10">Please log in to use the chat.</p>
        );
      case 'events':
        return <EventsPage projectId={projectId} user={user} supabase={supabase} />;
      case 'profile':
        return user ? (
          <UserProfile projectId={projectId} user={user} supabase={supabase} setUser={setUser} />
        ) : (
          <p className="text-red-400 text-center py-10">Please log in to view your profile.</p>
        );
      default:
        return <PublicHome projectId={projectId} user={user} supabase={supabase} handleNavigate={handleNavigate} />;
    }
  };

  // --- Navigation Bar Component ---
  const NavButton = ({ page, label, Icon }: { page: Page, label: string, Icon: any }) => (
    <button
      onClick={() => handleNavigate(page)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 
        ${currentPage === page
          ? 'bg-emerald-600/30 text-emerald-50 font-semibold'
          : 'text-emerald-300 hover:bg-emerald-700/20 hover:text-white'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const MobileNavButton = ({ page, label, Icon }: { page: Page, label: string, Icon: any }) => (
    <button
      onClick={() => handleNavigate(page)}
      className={`flex w-full items-center space-x-3 px-4 py-3 text-lg rounded-lg transition-all duration-200 
        ${currentPage === page
          ? 'bg-emerald-600/50 text-white font-semibold'
          : 'text-emerald-100 hover:bg-emerald-700/30'
        }`}
    >
      <Icon className="w-6 h-6" />
      <span>{label}</span>
    </button>
  );


  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-900 font-inter">
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md shadow-lg shadow-emerald-900/10 border-b border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and App Title */}
            <div className="flex-shrink-0 flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigate('home')}>
              <img src={logoImage} alt="রুপান্তর" className="h-10 w-auto rounded-xl shadow-lg" />
              <span className="text-xl font-extrabold text-white hidden sm:block">Rupantor</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <NavButton page="home" label="Home" Icon={Home} />
              <NavButton page="events" label="Events" Icon={Calendar} />
              <NavButton page="contact" label="Contact" Icon={Phone} />
              
              {user && (
                <>
                  <NavButton page="profile" label="Profile" Icon={LayoutDashboard} />
                  {user.role === 'admin' && <NavButton page="admin" label="Admin" Icon={LayoutDashboard} />}
                  {user.role === 'volunteer' && <NavButton page="volunteer" label="Volunteer" Icon={LayoutDashboard} />}
                  {(user.role === 'admin' || user.role === 'volunteer') && <NavButton page="chat" label="Chat" Icon={MessageSquare} />}
                </>
              )}
            </nav>

            {/* Auth/User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-emerald-300 font-medium truncate max-w-xs">{user.full_name || user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-red-300 hover:bg-red-900/30 transition-colors duration-200 flex items-center space-x-1"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm hidden lg:inline">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigate('auth')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  Log In / Sign Up
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-emerald-400 hover:text-white hover:bg-emerald-800/50 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden fixed top-20 left-0 w-full bg-gray-900/95 backdrop-blur-md z-30 transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full h-0 overflow-hidden'}`}
      >
        <div className="flex flex-col space-y-2 p-4 border-b border-emerald-800/30">
          <MobileNavButton page="home" label="Home" Icon={Home} />
          <MobileNavButton page="events" label="Events" Icon={Calendar} />
          <MobileNavButton page="contact" label="Contact Us" Icon={Phone} />

          {user && (
            <>
              <MobileNavButton page="profile" label="Profile" Icon={LayoutDashboard} />
              {user.role === 'admin' && <MobileNavButton page="admin" label="Admin Dashboard" Icon={LayoutDashboard} />}
              {user.role === 'volunteer' && <MobileNavButton page="volunteer" label="Volunteer Dashboard" Icon={LayoutDashboard} />}
              {(user.role === 'admin' || user.role === 'volunteer') && <MobileNavButton page="chat" label="Team Chat" Icon={MessageSquare} />}
              
              <div className="pt-4 border-t border-emerald-800/30">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-3 px-4 py-3 text-lg rounded-lg text-red-300 hover:bg-red-900/30 transition-colors"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Logout ({user.full_name || user.email})</span>
                </button>
              </div>
            </>
          )}

          {!user && (
            <div className="pt-4 border-t border-emerald-800/30">
              <button
                onClick={() => handleNavigate('auth')}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Log In / Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {renderCurrentPage()}
        </div>
      </main>
      
      {/* Footer (Simplified for the update) */}
      <footer className="bg-gray-950 border-t border-emerald-800/30 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-emerald-400/60">
            © 2025 Rupantor Climate Action App. Built on Supabase and React.
          </p>
        </div>
      </footer>
    </div>
  );
}
