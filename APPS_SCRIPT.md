# Google Apps Script Setup Instructions

Untuk menghubungkan aplikasi React ini dengan Google Sheets, ikuti langkah berikut:

## 1. Persiapan Google Sheet
1. Buat Google Sheet baru di [sheets.google.com](https://sheets.google.com).
2. Beri nama (misal: "Database SOP NBC").
3. Buat 3 Tab (Sheet) di bawah:
   - **Users** (Header baris 1: `uid`, `name`, `role`, `updated_at`)
   - **Checklist** (Header baris 1: `date`, `item_id`, `checked`, `by`, `time`, `timestamp`)
   - **Finance** (Header baris 1: `id`, `date`, `omzet`, `ops`, `gaji`, `profit`, `saved_by`, `timestamp`, `note`)

## 2. Pasang Script
1. Di Google Sheet, klik menu **Extensions** > **Apps Script**.
2. Hapus kode yang ada, dan copy-paste kode di bawah ini.
3. Klik tombol **Save** (ikon disket).

## 3. Deploy sebagai Web App
1. Klik tombol **Deploy** (biru kanan atas) > **New deployment**.
2. Pilih type: **Web app**.
3. Isi Description: "API v1".
4. **Execute as**: *Me* (email anda).
5. **Who has access**: **Anyone** (PENTING: Pilih "Anyone" agar aplikasi bisa akses tanpa login Google).
6. Klik **Deploy**.
7. Salin **Web App URL** yang muncul (dimulai dengan `https://script.google.com/macros/s/...`).
8. Simpan URL ini untuk dimasukkan ke aplikasi React nanti.

---

## Kode Apps Script (Code.gs)

```javascript
const SHEET_ID = ""; // KOSONGKAN JIKA SCRIPT DI DALAM SHEET YANG SAMA (Recommended)

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Handle preflight options (jika browser mengirimnya, meski GAS jarang handle ini dengan benar)
  // Biasanya GAS handle POST via form-data atau text/plain untuk hindari preflight complex
  
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    let result = {};
    
    if (action === "getUsers") {
      result = getData(ss, "Users");
    } else if (action === "getChecklist") {
      const date = e.parameter.date || new Date().toISOString().split('T')[0];
      result = getChecklist(ss, date);
    } else if (action === "getFinance") {
      result = getData(ss, "Finance");
      // Sort desc by timestamp if needed, but simple array is fine
      result.data.reverse(); // Newest first
    } else if (action === "updateChecklist") {
      // Expecting JSON body in POST
      const body = JSON.parse(e.postData.contents);
      result = updateChecklist(ss, body);
    } else if (action === "addFinance") {
      const body = JSON.parse(e.postData.contents);
      result = addFinance(ss, body);
    } else if (action === "ping") {
      result = { status: "online", message: "Sistem NBC Cloud Siap" };
    } else {
      result = { error: "Unknown action" };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      // GAS tidak support setHeader custom untuk CORS penuh di semua response, 
      // tapi return JSON biasanya cukup jika client fetch mode 'cors' atau 'no-cors' hati-hati.
      // Trik: JSONP atau Proxy. Untuk simpel, kita return JSON biasa.
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- Helpers ---

function getData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { data: [] };
  
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
  
  return { data: data };
}

function getChecklist(ss, dateStr) {
  const sheet = ss.getSheetByName("Checklist");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter by date
  // Column 0 is date usually based on our schema
  // Header: date, item_id, checked, by, time, timestamp
  
  const filtered = data.slice(1).filter(r => {
    // Convert date object from sheet to string YYYY-MM-DD
    let rDate = r[0];
    if (rDate instanceof Date) {
      rDate = rDate.toISOString().split('T')[0];
    }
    return rDate === dateStr;
  });
  
  // Convert to map for easy frontend usage: { item_id: { checked: true, by: ... } }
  const map = {};
  filtered.forEach(r => {
    map[r[1]] = {
      checked: r[2] === true || r[2] === "TRUE",
      by: r[3],
      time: r[4]
    };
  });
  
  return { date: dateStr, items: map };
}

function updateChecklist(ss, body) {
  // Body: { date, item_id, checked, by, time }
  const sheet = ss.getSheetByName("Checklist");
  const date = body.date;
  const itemId = body.item_id;
  
  // Cek jika sudah ada entry untuk date + item_id ini
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    let rDate = data[i][0];
    if (rDate instanceof Date) rDate = rDate.toISOString().split('T')[0];
    
    if (rDate === date && data[i][1] === itemId) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }
  
  const timestamp = new Date();
  
  if (rowIndex > 0) {
    // Update
    // Cols: 1=date, 2=item_id, 3=checked, 4=by, 5=time, 6=timestamp
    sheet.getRange(rowIndex, 3).setValue(body.checked);
    sheet.getRange(rowIndex, 4).setValue(body.by);
    sheet.getRange(rowIndex, 5).setValue(body.time);
    sheet.getRange(rowIndex, 6).setValue(timestamp);
  } else {
    // Insert
    sheet.appendRow([date, itemId, body.checked, body.by, body.time, timestamp]);
  }
  
  return { success: true };
}

function addFinance(ss, body) {
  const sheet = ss.getSheetByName("Finance");
  // Header: id, date, omzet, ops, gaji, profit, saved_by, timestamp, note
  const id = Utilities.getUuid();
  const timestamp = new Date();
  
  sheet.appendRow([
    id, 
    body.date, 
    body.omzet, 
    body.ops, 
    body.gaji, 
    body.profit, 
    body.saved_by, 
    timestamp, 
    body.note || ''
  ]);
  
  return { success: true, id: id };
}
```
