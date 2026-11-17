import React, { useState, useEffect } from 'react';
import { SingleViewRoom } from './components/SingleViewRoom';
import { MultiViewRoom } from './components/MultiViewRoom';
import { getPuterUser, signInPuter, signOutPuter, switchPuterAccount, PuterUser } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [user, setUser] = useState<PuterUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  useEffect(() => {
    getPuterUser().then(setUser);
  }, []);

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    try {
      const u = await signInPuter();
      setUser(u);
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsLoadingAuth(true);
    try {
      const u = await switchPuterAccount();
      setUser(u);
    } catch (err) {
      console.error('Switch account failed:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = () => {
    signOutPuter();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1E40AF] border-b border-indigo-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#22D3EE] rounded-lg flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-900" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">RoomGen AI</h1>
          </div>

          {/* Navigation & Puter Account */}
          <div className="flex items-center gap-3">
            <div className="flex space-x-1 bg-indigo-900/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'single'
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-800'
                }`}
              >
                Single View
              </button>
              <button
                onClick={() => setActiveTab('multi')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'multi'
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-800'
                }`}
              >
                Multi View
              </button>
            </div>

            {/* Puter Account Controls */}
            <div className="flex items-center gap-2 border-l border-indigo-700/60 pl-3">
              {user ? (
                <div className="flex items-center gap-2 bg-indigo-900/60 py-1 px-2.5 rounded-lg border border-indigo-700">
                  <div className="w-6 h-6 rounded-full bg-cyan-400 text-indigo-950 font-bold text-xs flex items-center justify-center">
                    {(user.username || 'P')[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-indigo-100 max-w-[120px] truncate font-medium">
                    {user.username || 'Connected'}
                  </span>
                  <button
                    onClick={handleSwitchAccount}
                    disabled={isLoadingAuth}
                    title="Switch Puter Account"
                    className="ml-1 text-xs bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white px-2 py-1 rounded transition-colors"
                  >
                    {isLoadingAuth ? 'Switching...' : 'Switch'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="text-xs text-indigo-300 hover:text-white px-1.5 py-1 rounded hover:bg-indigo-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoadingAuth}
                  className="text-xs bg-indigo-900/70 hover:bg-indigo-800 active:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {isLoadingAuth ? 'Connecting...' : 'Puter Account'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12 w-full">
        {/* Intro */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {activeTab === 'single' ? 'Redesign Your Space with AI' : 'Consistent Multi-View Redesign'}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            {activeTab === 'single'
              ? 'Upload a photo, choose a style, and let our AI transform your interior while preserving the layout you love.'
              : 'Upload multiple angles of the same room to maintain style and material consistency across all views.'}
          </p>
        </div>

        {activeTab === 'single' ? <SingleViewRoom /> : <MultiViewRoom />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by <span className="font-medium text-gray-700">Google Gemini</span> image generation. Prototype for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
