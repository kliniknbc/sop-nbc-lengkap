import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('terapis');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data user. Cek koneksi internet.');
      setUsers([]);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    // Check if user is NEW (not selected from list)
    // If selected from list, we usually handle it in handleUserSelect, but good to be robust
    const existing = users.find(u => u.name === name);

    if (existing) {
      onLogin(existing);
      onClose();
    } else {
      // Register New
      setLoading(true);
      try {
        const newUser = { name, role };
        const res = await api.addUser(newUser);
        if (res.success) {
          onLogin(newUser);
          onClose();
        } else {
          throw new Error("Gagal mendaftar");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal mendaftarkan user baru.");
      }
      setLoading(false);
    }
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

        <div className="space-y-4">
          {/* Option 1: Select Existing */}
          <div className={`p-4 rounded-lg border transition ${!name ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 opacity-50'}`}>
            <label className="block text-sm font-bold text-stone-700 mb-2">Pilih User Tersimpan</label>
            {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
            <select
              onChange={handleUserSelect}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              disabled={loading || !!name} // Disable if typing name (creating new)
            >
              <option value="">{loading ? 'Memuat data...' : '-- Pilih Nama Anda --'}</option>
              {users.map((u, idx) => (
                <option key={u.uid || idx} value={u.uid}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-xs">ATAU DAFTAR BARU</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          {/* Option 2: Add New */}
          <form onSubmit={handleSubmit} className={`p-4 rounded-lg border transition ${name ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
            <div className="mb-3">
              <label className="block text-sm font-bold text-stone-700 mb-1">Nama Baru</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (e.target.value) setRole('terapis'); }}
                placeholder="Ketik nama anda..."
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {name && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-stone-700 mb-1">Peran</label>
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
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-lg transform active:scale-95 flex justify-center items-center gap-2"
                >
                  {loading ? 'Menyimpan...' : '➕ Daftar & Masuk'}
                </button>
              </div>
            )}
          </form>
        </div>

        <button onClick={onClose} className="mt-4 w-full text-stone-400 text-sm hover:text-stone-600">
          Batal / Tutup
        </button>
      </div>
    </div>
  );
}
