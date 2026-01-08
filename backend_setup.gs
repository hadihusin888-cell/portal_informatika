
/**
 * GOOGLE APPS SCRIPT BACKEND - E-LEARNING INFORMATIKA
 * Instansi: SMP AL Irsyad Surakarta
 * 
 * PETUNJUK INSTALASI:
 * 1. Buka Google Sheets Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) -> 'Apps Script'.
 * 3. Hapus semua kode yang ada di editor 'Code.gs'.
 * 4. Tempel (Paste) seluruh kode di bawah ini.
 * 5. Klik ikon simpan (floppy disk).
 * 6. Klik tombol 'Deploy' -> 'New Deployment'.
 * 7. Pilih type: 'Web App'.
 * 8. Deskripsi: 'E-Learning API v2.0'.
 * 9. Execute as: 'Me' (Saya).
 * 10. Who has access: 'Anyone' (Siapa saja).
 * 11. Klik 'Deploy', berikan izin (Authorize), dan SALIN 'Web App URL' yang muncul.
 * 12. Tempel URL tersebut ke variabel GAS_API_URL di file App.tsx aplikasi Anda.
 */

function doGet(e) {
  var key = e.parameter.key;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(key);
  
  // Jika sheet tidak ada, kembalikan array kosong
  if (!sheet) {
    return createJsonResponse([]);
  }
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    // Jika hanya ada header atau kosong sama sekali
    return createJsonResponse([]);
  }

  var headers = data[0];
  var jsonResult = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var cellValue = data[i][j];
      // Pastikan data tanggal dikonversi ke string agar tidak error di JSON.stringify
      if (cellValue instanceof Date) {
        obj[headers[j]] = Utilities.formatDate(cellValue, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH:mm:ss");
      } else {
        obj[headers[j]] = cellValue;
      }
    }
    jsonResult.push(obj);
  }
  
  // Penanganan khusus untuk pengaturan situs (objek tunggal, bukan array)
  if (key === 'elearning_site_settings' && jsonResult.length > 0) {
    return createJsonResponse(jsonResult[0]);
  }

  return createJsonResponse(jsonResult);
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action; // SAVE_ALL, APPEND_ROW, DELETE_SHEET
    var key = postData.key;
    var value = postData.value;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(key);
    
    // 1. AKSI PENGHAPUSAN SHEET
    if (action === 'DELETE_SHEET') {
      if (sheet) {
        ss.deleteSheet(sheet);
        return createJsonResponse({ status: "success", message: "Sheet " + key + " deleted" });
      }
      return createJsonResponse({ status: "not_found", message: "Sheet not exist" });
    }
    
    // Buat sheet jika belum ada (kecuali aksi delete)
    if (!sheet) {
      sheet = ss.insertSheet(key);
    }
    
    // 2. AKSI SIMPAN SEMUA (OVERWRITE)
    if (action === 'SAVE_ALL') {
      sheet.clear();
      if (Array.isArray(value) && value.length > 0) {
        var headers = Object.keys(value[0]);
        sheet.appendRow(headers);
        var rows = value.map(function(item) {
          return headers.map(function(h) { return item[h]; });
        });
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Logika untuk objek tunggal seperti site_settings
        var keys = Object.keys(value);
        sheet.appendRow(keys);
        sheet.appendRow(keys.map(function(k) { return value[k]; }));
      }
    } 
    
    // 3. AKSI TAMBAH BARIS (UNTUK NOTIFIKASI)
    else if (action === 'APPEND_ROW') {
      var dataRange = sheet.getDataRange();
      var lastRow = dataRange.getLastRow();
      
      // Jika sheet baru/kosong, buat header dulu
      if (lastRow === 0) {
        var headers = Object.keys(value);
        sheet.appendRow(headers);
      }
      
      var currentHeaders = sheet.getDataRange().getValues()[0];
      var newRowData = currentHeaders.map(function(h) { 
        return value[h] !== undefined ? value[h] : ""; 
      });
      sheet.appendRow(newRowData);
    }
    
    return createJsonResponse({ status: "success" });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Fungsi pembantu untuk membuat output JSON dengan header CORS yang benar
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
