import { Home, ClipboardList, Wallet, Headphones, Megaphone, Users, LogOut, User } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, onOpenLogin }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'operasional', label: 'Operasional', icon: ClipboardList },
    { id: 'keuangan', label: 'Keuangan', icon: Wallet },
    { id: 'cs', label: 'Customer Service', icon: Headphones },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'sdm', label: 'SDM', icon: Users },
  ];

  return (
    <aside className="bg-white w-72 border-r border-stone-200 hidden lg:flex flex-col h-full shadow-xl lg:shadow-none z-40">
      <div className="p-6 border-b border-stone-100 flex-shrink-0">
        <div className="text-2xl font-bold text-emerald-700 tracking-tight leading-none">
          RUMAH SEHAT <br />
          <span className="text-stone-600 text-lg">Bekam NBC</span>
        </div>
        
        <div className="flex items-center gap-2 mt-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
          <div className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-emerald-800 text-sm truncate">
              {currentUser ? currentUser.name : 'Tamu'}
            </div>
            <div className="text-emerald-600 text-xs truncate">
              {currentUser ? (currentUser.role === 'manager' ? 'Manager' : 'Terapis') : 'Silakan Login'}
            </div>
          </div>
          {currentUser ? (
             <button onClick={onLogout} title="Keluar" className="text-stone-500 hover:text-red-500 transition">
               <LogOut size={16} />
             </button>
          ) : (
             <button onClick={onOpenLogin} title="Login" className="text-emerald-600 hover:text-emerald-800 transition">
               <User size={16} />
             </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 font-medium ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600' 
                  : 'text-stone-600 hover:bg-stone-50 hover:text-emerald-600'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-200 text-xs text-center text-stone-400">
        v2.0 • Google Sheets DB
      </div>
    </aside>
  );
}
