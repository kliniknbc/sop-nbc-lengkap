import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CHECKLIST_ITEMS } from '../config/items';

export default function Dashboard({ setActiveTab }) {
  const [checklistStatus, setChecklistStatus] = useState({ total: 0, checked: 0, loading: true });
  const [profitToday, setProfitToday] = useState({ amount: 0, loading: true });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user name
    const user = JSON.parse(localStorage.getItem('sop_user') || '{}');
    if (user.name) setUserName(user.name);

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Load Checklist
    try {
      const checklistData = await api.getChecklist(today);
      // Assuming checklist items are fixed for now (based on Operasional.jsx)
      // We really should have a centralized items config. 
      // For now, let's count keys in the items object that have checked: true
      const items = checklistData.items || {};
      const checkedCount = Object.values(items).filter(i => i.checked).length;
      // Total items is hardcoded in Operasional, let's estimate or just show checked count
      // Ideally we import the items list from Operasional or a config file.
      // For now, let's assume 4 items as per Operasional.jsx logic (it won't receive total from API unless we change API).
      const totalEstimated = CHECKLIST_ITEMS.length;
      setChecklistStatus({ total: totalEstimated, checked: checkedCount, loading: false });
    } catch (e) {
      console.error("Dashboard checklist load error", e);
      setChecklistStatus({ total: CHECKLIST_ITEMS.length, checked: 0, loading: false, error: true });
    }

    // 2. Load Finance
    try {
      const financeData = await api.getFinance();
      // Filter for today
      // API returns all history.
      // Data format: { date: 'YYYY-MM-DD', profit: ... }
      const todayRecord = financeData.find(f => f.date === today);
      setProfitToday({ amount: todayRecord ? todayRecord.profit : 0, loading: false });
    } catch (e) {
      console.error("Dashboard finance load error", e);
      setProfitToday({ amount: 0, loading: false, error: true });
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">
            {userName ? `Halo, ${userName}!` : 'Dashboard Operasional'}
          </h2>
          <p className="opacity-90">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Checklist */}
        <div
          onClick={() => setActiveTab('operasional')}
          className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 cursor-pointer hover:border-emerald-500 transition group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-stone-700 group-hover:text-emerald-700 transition text-lg">Checklist Harian</h3>
              <p className="text-sm text-stone-500">Kebersihan & Persiapan</p>
            </div>
            <div className={`p-3 rounded-full ${checklistStatus.checked === checklistStatus.total ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-600'}`}>
              <span className="text-xl font-bold">
                {checklistStatus.loading ? '-' : `${checklistStatus.checked}/${checklistStatus.total}`}
              </span>
            </div>
          </div>

          <div className="w-full bg-stone-100 rounded-full h-2.5 mb-1">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: checklistStatus.loading ? '0%' : `${Math.min((checklistStatus.checked / checklistStatus.total) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-stone-400 text-right">Progress Hari Ini</div>
        </div>

        {/* Card Keuangan */}
        <div
          onClick={() => setActiveTab('keuangan')}
          className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 cursor-pointer hover:border-emerald-500 transition group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-stone-700 group-hover:text-emerald-700 transition text-lg">Laporan Keuangan</h3>
              <p className="text-sm text-stone-500">Profit Bersih Hari Ini</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
          </div>

          <div className="text-3xl font-bold text-stone-800 tracking-tight">
            {profitToday.loading ? (
              <span className="animate-pulse bg-stone-200 text-transparent rounded">Rp ...</span>
            ) : (
              <span className={profitToday.amount > 0 ? 'text-emerald-600' : 'text-stone-400'}>
                {formatRupiah(profitToday.amount)}
              </span>
            )}
          </div>
          <div className="text-xs text-stone-400 mt-2">
            Status: {profitToday.loading ? 'Syncing...' : (profitToday.error ? 'Error' : 'Tersimpan di Cloud')}
          </div>
        </div>
      </div>
    </div>
  );
}
