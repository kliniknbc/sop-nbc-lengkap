import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('terapis');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await api.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleUserSelect = (e) => {
    const selectedUid = e.target.value;
    if (!selectedUid) return;
    
    const user = users.find(u => String(u.uid) === selectedUid);
    if (user) {
      setName(user.name);
      setRole(user.role);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onLogin({ name, role });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/80 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-emerald-500 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="text-2xl font-bold text-stone-800">Login Sistem SOP</h2>
          <p className="text-stone-500 text-sm">Masuk untuk menyimpan progress kerja.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Pilih User Tersimpan</label>
            <select 
              onChange={handleUserSelect}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-stone-50"
              disabled={loading}
            >
              <option value="">{loading ? 'Memuat data...' : '-- Pilih User --'}</option>
              {users.map((u, idx) => (
                <option key={u.uid || idx} value={u.uid}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-xs">ATAU INPUT BARU</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Nama Anda</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Contoh: Ahmad" 
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Peran / Jabatan</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="terapis">Terapis / Staff</option>
              <option value="manager">Manager / Owner</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-lg transform active:scale-95"
          >
            Masuk Sistem
          </button>
        </form>
        
        <button onClick={onClose} className="mt-4 w-full text-stone-400 text-sm hover:text-stone-600">
          Batal / Tutup
        </button>
      </div>
    </div>
  );
}
