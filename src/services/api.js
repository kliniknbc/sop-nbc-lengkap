// Ganti URL ini dengan URL Web App dari Google Apps Script Anda
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyC0H_y7MQWzdEsDLEYr-0l3ZRsTC-IS23BgjzF3WG_k-3lycufZxJVItHFV2dJSdqR/exec"; 

// Helper untuk mendeteksi mode demo
const isDemo = () => GOOGLE_SCRIPT_URL.includes("AKfycbx...");

export const api = {
  // --- USERS ---
  getUsers: async () => {
    if (isDemo()) return mockUsers;
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUsers`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    } catch (e) {
      console.error("API Error (getUsers):", e);
      throw e;
    }
  },

  // --- CHECKLIST ---
  getChecklist: async (date) => {
    if (isDemo()) return mockChecklist(date);
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getChecklist&date=${date}`);
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
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=updateChecklist`, {
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
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getFinance`);
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
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=addFinance`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      console.error("API Error (addFinance):", e);
      throw e;
    }
  }
};

// --- MOCK DATA ---
const mockUsers = [
  { uid: '1', name: 'Ahmad', role: 'terapis' },
  { uid: '2', name: 'Budi', role: 'manager' }
];

const mockChecklist = (date) => ({
  date,
  items: {
    'clean_floor': { checked: true, by: 'Ahmad', time: '08:00' }
  }
});

const mockFinance = [
  { date: '2025-02-09', omzet: 1000000, profit: 500000, saved_by: 'Budi', profit_display: 'Rp 500.000' }
];
