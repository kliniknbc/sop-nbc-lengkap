// Default URL (Fallback/Demo)
const DEFAULT_URL = "https://script.google.com/macros/s/AKfycbyC0H_y7MQWzdEsDLEYr-0l3ZRsTC-IS23BgjzF3WG_k-3lycufZxJVItHFV2dJSdqR/exec";

// Get URL from LocalStorage or use Default
export const getScriptUrl = () => localStorage.getItem('google_script_url') || DEFAULT_URL;

// Helper untuk mendeteksi mode demo (jika URL default/demo)
const isDemo = () => getScriptUrl().includes("AKfycbyC0H_y7MQWzdEsDLEYr-0l3ZRsTC-IS23BgjzF3WG_k-3lycufZxJVItHFV2dJSdqR");

export const api = {
  // --- USERS ---
  getUsers: async () => {
    if (isDemo()) return mockUsers;
    try {
      const res = await fetch(`${getScriptUrl()}?action=getUsers`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    } catch (e) {
      console.error("API Error (getUsers):", e);
      throw e;
    }
  },

  addUser: async (user) => {
    // user: { name, role }
    if (isDemo()) {
      console.log("Mock Add User:", user);
      return { success: true, ...user };
    }
    try {
      const res = await fetch(`${getScriptUrl()}?action=addUser`, {
        method: "POST",
        body: JSON.stringify(user),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      console.error("API Error (addUser):", e);
      throw e;
    }
  },

  // --- CHECKLIST ---
  getChecklist: async (date) => {
    if (isDemo()) return mockChecklist(date);
    try {
      const res = await fetch(`${getScriptUrl()}?action=getChecklist&date=${date}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      console.error("API Error (getChecklist):", e);
      throw e;
    }
  },

  updateChecklist: async (data) => {
    // data: { date, item_id, checked, by, time }
    if (isDemo()) {
      console.log("Mock Update:", data);
      return { success: true };
    }
    try {
      // Menggunakan no-cors atau text/plain untuk menghindari preflight issue di GAS
      const res = await fetch(`${getScriptUrl()}?action=updateChecklist`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      // Note: GAS POST response might be opaque in no-cors, but here we assume standard CORS or JSON
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      console.error("API Error (updateChecklist):", e);
      throw e;
    }
  },

  // --- FINANCE ---
  getFinance: async () => {
    if (isDemo()) return mockFinance;
    try {
      const res = await fetch(`${getScriptUrl()}?action=getFinance`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    } catch (e) {
      console.error("API Error (getFinance):", e);
      throw e;
    }
  },

  addFinance: async (data) => {
    if (isDemo()) {
      console.log("Mock Finance Add:", data);
      return { success: true };
    }
    try {
      const res = await fetch(`${getScriptUrl()}?action=addFinance`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      console.error("API Error (addFinance):", e);
    }
  },
  // --- MASTER DATA (Universal CRUD) ---
  getMasterData: async (category) => {
    if (isDemo()) return mockMasterData(category);
    try {
      const res = await fetch(`${getScriptUrl()}?action=getMasterData&category=${category}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    } catch (e) {
      console.error("API Error (getMasterData):", e);
      return []; // Return empty on error to avoid crash
    }
  },

  addMasterData: async (category, content) => {
    if (isDemo()) return { success: true, id: Date.now(), content };
    try {
      const res = await fetch(`${getScriptUrl()}?action=addData`, {
        method: "POST",
        body: JSON.stringify({ category, content, sheetName: "MasterData" }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      console.error("API Error (addMasterData):", e);
      throw e;
    }
  },

  deleteData: async (sheetName, id) => {
    if (isDemo()) return { success: true };
    try {
      const res = await fetch(`${getScriptUrl()}?action=deleteData`, {
        method: "POST",
        body: JSON.stringify({ sheetName, id }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      console.error("API Error (deleteData):", e);
      throw e;
    }
  }
};

// --- MOCK DATA ---
const mockUsers = [
  { uid: '1', name: 'Ahmad', role: 'terapis' },
  { uid: '2', name: 'Budi', role: 'manager' }
];

const mockMasterData = (cat) => {
  if (cat === 'checklist') return [
    { id: '1', content: 'Sapu & Pel seluruh area' },
    { id: '2', content: 'Cek Stok Alkohol' }
  ];
  return [];
};

const mockChecklist = (date) => ({
  date,
  items: {
    'clean_floor': { checked: true, by: 'Ahmad', time: '08:00' }
  }
});

const mockFinance = [
  { date: '2025-02-09', omzet: 1000000, profit: 500000, saved_by: 'Budi', profit_display: 'Rp 500.000' }
];
