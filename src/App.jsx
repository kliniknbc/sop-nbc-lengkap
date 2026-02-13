import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Operasional from './components/Operasional';
import Keuangan from './components/Keuangan';
import LoginModal from './components/LoginModal';
import Settings from './components/Settings';
import GenericList from './components/GenericList'; // New
import { Menu } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState({ message: '', isError: false, show: false });

  // Load User from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('sop_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('sop_user', JSON.stringify(user));
    showToast(`Selamat datang, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sop_user');
    showToast('Anda telah keluar.');
    setIsLoginModalOpen(true);
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'operasional': return <Operasional currentUser={currentUser} showToast={showToast} />;
      case 'keuangan': return <Keuangan currentUser={currentUser} showToast={showToast} />;
      case 'cs': return (
        <GenericList
          title="Customer Service Scripts"
          category="cs"
          placeholder="Tambah script/panduan CS baru..."
          currentUser={currentUser}
          showToast={showToast}
        />
      );
      case 'marketing': return (
        <GenericList
          title="Marketing Targets & Ideas"
          category="marketing"
          placeholder="Tambah target/campaign baru..."
          currentUser={currentUser}
          showToast={showToast}
        />
      );
      case 'sdm': return (
        <GenericList
          title="SDM & HR Guidelines"
          category="sdm"
          placeholder="Tambah aturan/pengumuman baru..."
          currentUser={currentUser}
          showToast={showToast}
        />
      );
      case 'settings': return <Settings showToast={showToast} />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 text-stone-800 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative z-40 h-full transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative w-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <h1 className="font-bold text-emerald-800">NBC Cloud</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-stone-100 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        <div className="p-4 lg:p-8 pb-20">
          {renderContent()}
        </div>
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Toast */}
      <div
        className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 z-50 ${toast.isError ? 'bg-red-600' : 'bg-emerald-600'
          } ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      >
        {toast.message}
      </div>

    </div>
  );
}

export default App;
