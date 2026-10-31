/**
 * KidStock - Google Apps Script Serverless Backend
 * 
 * Automatically creates and syncs the dedicated 'KidStock' directory in your Google Drive!
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new) and name it "KidStock - Family Portfolio"
 * 2. Click Extensions > Apps Script
 * 3. Delete any code and paste this entire file
 * 4. Click Deploy > New deployment
 * 5. Select type: "Web app"
 * 6. Set Description: "KidStock API"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"
 * 9. Click Deploy, approve the Drive/Sheets permissions, and copy the Web App URL into KidStock!
 * 
 * Result: Automatically creates the "KidStock" folder in your Drive and moves this sheet inside it!
 */

function ensureKidStockFolder() {
  try {
    var folders = DriveApp.getFoldersByName("KidStock");
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder("KidStock");
      folder.setDescription("KidStock Family Portfolio automated synchronization folder");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var file = DriveApp.getFileById(ss.getId());
    
    // Check if spreadsheet is inside KidStock folder, if not add it
    var parents = file.getParents();
    var isInFolder = false;
    while (parents.hasNext()) {
      var p = parents.next();
      if (p.getId() === folder.getId()) {
        isInFolder = true;
        break;
      }
    }
    if (!isInFolder) {
      folder.addFile(file);
    }

    return {
      folderId: folder.getId(),
      folderUrl: "https://drive.google.com/drive/folders/" + folder.getId(),
      fileId: file.getId(),
      fileUrl: ss.getUrl()
    };
  } catch (e) {
    return {
      folderId: null,
      folderUrl: null,
      fileId: SpreadsheetApp.getActiveSpreadsheet().getId(),
      fileUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      error: e.toString()
    };
  }
}

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Profiles
  var profilesSheet = ss.getSheetByName("Profiles") || ss.insertSheet("Profiles");
  if (profilesSheet.getLastRow() === 0) {
    profilesSheet.appendRow(["ID", "Name", "GoogleEmail", "Avatar", "Color", "CashBalance", "TotalDeposited", "TotalWithdrawn", "CreatedAt", "UpdatedAt"]);
    profilesSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#E2E8F0");
  }

  // Sheet 2: BuyLots
  var lotsSheet = ss.getSheetByName("BuyLots") || ss.insertSheet("BuyLots");
  if (lotsSheet.getLastRow() === 0) {
    lotsSheet.appendRow(["LotID", "ChildID", "Ticker", "BuyDate", "OriginalShares", "RemainingShares", "BuyPrice", "TotalCost", "Note"]);
    lotsSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#E2E8F0");
  }

  // Sheet 3: Transactions
  var txSheet = ss.getSheetByName("Transactions") || ss.insertSheet("Transactions");
  if (txSheet.getLastRow() === 0) {
    txSheet.appendRow(["TxID", "Timestamp", "ChildID", "Type", "Ticker", "Shares", "PricePerShare", "TotalAmount", "RealizedGainLoss", "PostBalance", "Note"]);
    txSheet.getRange("A1:K1").setFontWeight("bold").setBackground("#E2E8F0");
  }

  // Sheet 4: Settings
  var settingsSheet = ss.getSheetByName("Settings") || ss.insertSheet("Settings");
  if (settingsSheet.getLastRow() === 0) {
    settingsSheet.appendRow(["Key", "Value"]);
    settingsSheet.appendRow(["parentPin", "1234"]);
    settingsSheet.appendRow(["currencySymbol", "$"]);
    settingsSheet.appendRow(["lastSync", new Date().toISOString()]);
  }
}

function doGet(e) {
  setupDatabase();
  var folderInfo = ensureKidStockFolder();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Read Profiles
  var pSheet = ss.getSheetByName("Profiles");
  var pData = pSheet.getDataRange().getValues();
  var profiles = [];
  for (var i = 1; i < pData.length; i++) {
    profiles.push({
      id: pData[i][0],
      name: pData[i][1],
      googleEmail: pData[i][2],
      avatar: pData[i][3],
      color: pData[i][4],
      cashBalance: Number(pData[i][5]),
      totalDeposited: Number(pData[i][6]),
      totalWithdrawn: Number(pData[i][7]),
      createdAt: pData[i][8]
    });
  }

  // Read BuyLots
  var lSheet = ss.getSheetByName("BuyLots");
  var lData = lSheet.getDataRange().getValues();
  var buyLots = [];
  for (var j = 1; j < lData.length; j++) {
    buyLots.push({
      id: lData[j][0],
      childId: lData[j][1],
      ticker: lData[j][2],
      buyDate: lData[j][3],
      originalShares: Number(lData[j][4]),
      remainingShares: Number(lData[j][5]),
      buyPrice: Number(lData[j][6]),
      totalCost: Number(lData[j][7]),
      note: lData[j][8]
    });
  }

  // Read Transactions
  var tSheet = ss.getSheetByName("Transactions");
  var tData = tSheet.getDataRange().getValues();
  var transactions = [];
  for (var k = 1; k < tData.length; k++) {
    transactions.push({
      id: tData[k][0],
      timestamp: tData[k][1],
      childId: tData[k][2],
      type: tData[k][3],
      ticker: tData[k][4] || undefined,
      shares: tData[k][5] ? Number(tData[k][5]) : undefined,
      pricePerShare: tData[k][6] ? Number(tData[k][6]) : undefined,
      totalAmount: Number(tData[k][7]),
      realizedGainLoss: tData[k][8] !== "" ? Number(tData[k][8]) : undefined,
      postBalance: Number(tData[k][9]),
      note: tData[k][10]
    });
  }

  var response = {
    folderInfo: folderInfo,
    folderId: folderInfo.folderId,
    folderUrl: folderInfo.folderUrl,
    spreadsheetUrl: folderInfo.fileUrl,
    profiles: profiles,
    buyLots: buyLots,
    transactions: transactions,
    lastSync: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  setupDatabase();
  var folderInfo = ensureKidStockFolder();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    var payload = JSON.parse(e.postData.contents);

    // Sync profiles
    if (payload.profiles) {
      var pSheet = ss.getSheetByName("Profiles");
      pSheet.clearContents();
      pSheet.appendRow(["ID", "Name", "GoogleEmail", "Avatar", "Color", "CashBalance", "TotalDeposited", "TotalWithdrawn", "CreatedAt", "UpdatedAt"]);
      payload.profiles.forEach(function(p) {
        pSheet.appendRow([p.id, p.name, p.googleEmail || "", p.avatar, p.color, p.cashBalance, p.totalDeposited, p.totalWithdrawn, p.createdAt, new Date().toISOString()]);
      });
    }

    // Sync BuyLots
    if (payload.buyLots) {
      var lSheet = ss.getSheetByName("BuyLots");
      lSheet.clearContents();
      lSheet.appendRow(["LotID", "ChildID", "Ticker", "BuyDate", "OriginalShares", "RemainingShares", "BuyPrice", "TotalCost", "Note"]);
      payload.buyLots.forEach(function(l) {
        lSheet.appendRow([l.id, l.childId, l.ticker, l.buyDate, l.originalShares, l.remainingShares, l.buyPrice, l.totalCost, l.note]);
      });
    }

    // Sync Transactions
    if (payload.transactions) {
      var tSheet = ss.getSheetByName("Transactions");
      tSheet.clearContents();
      tSheet.appendRow(["TxID", "Timestamp", "ChildID", "Type", "Ticker", "Shares", "PricePerShare", "TotalAmount", "RealizedGainLoss", "PostBalance", "Note"]);
      payload.transactions.forEach(function(t) {
        tSheet.appendRow([t.id, t.timestamp, t.childId, t.type, t.ticker || "", t.shares || "", t.pricePerShare || "", t.totalAmount, t.realizedGainLoss !== undefined ? t.realizedGainLoss : "", t.postBalance, t.note]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      folderInfo: folderInfo,
      folderId: folderInfo.folderId,
      folderUrl: folderInfo.folderUrl,
      spreadsheetUrl: folderInfo.fileUrl
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
