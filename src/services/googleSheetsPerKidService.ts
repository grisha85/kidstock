/**
 * Google Sheets Backend Service for KidStock
 * 
 * Manages:
 * 1. Dedicated Google Spreadsheet per child (e.g. 'Emma - Portfolio', 'Liam - Portfolio')
 *    with 3 human-readable tabs:
 *    - Holdings (Symbol, Company, Category, Total Shares, Avg Price, Total Cost, Current Price, Current Value, Profit/Loss, Return %)
 *    - Ledger (Date & Time, Type, Symbol, Shares, Price, Total Cash Amount, Realized Gain, Balance After, Note)
 *    - Overview (Child Name, Cash Balance, Total Deposited, Total Withdrawn, Created Date, Last Synced)
 * 2. General config in 'config.json' inside the 'KidStock' folder.
 * 3. Race condition mitigation:
 *    - Concurrency queue / mutex per kid
 *    - Atomic ledger append via Google Sheets append API (sheets.spreadsheets.values.append)
 *    - ETag tracking for config.json (Optimistic Concurrency Control)
 */

import { ChildProfile, TransactionRecord, AggregatedHolding, FamilyData } from '../types';

export interface KidSheetInfo {
  childId: string;
  childName: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  lastUpdated: string;
}

export class GoogleSheetsPerKidService {
  private sheetsMap: Map<string, KidSheetInfo> = new Map();
  private childMutexLocks: Map<string, Promise<void>> = new Map();
  private configEtag: string | null = null;
  private readonly STORAGE_KEY_SHEET_MAP = 'kidstock_kids_sheet_map';

  constructor() {
    this.loadCachedSheetMap();
  }

  private loadCachedSheetMap() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_SHEET_MAP);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([childId, info]) => {
          this.sheetsMap.set(childId, info as KidSheetInfo);
        });
      }
    } catch {
      // ignore
    }
  }

  private persistSheetMap() {
    const obj: Record<string, KidSheetInfo> = {};
    this.sheetsMap.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(this.STORAGE_KEY_SHEET_MAP, JSON.stringify(obj));
  }

  /**
   * Acquire an async mutex for a specific child to prevent client-side race conditions.
   */
  private async acquireChildLock<T>(childId: string, task: () => Promise<T>): Promise<T> {
    while (this.childMutexLocks.has(childId)) {
      await this.childMutexLocks.get(childId);
    }

    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.childMutexLocks.set(childId, lockPromise);

    try {
      return await task();
    } finally {
      this.childMutexLocks.delete(childId);
      releaseLock();
    }
  }

  public getKidSheetInfo(childId: string): KidSheetInfo | undefined {
    return this.sheetsMap.get(childId);
  }

  public getAllKidSheets(): KidSheetInfo[] {
    return Array.from(this.sheetsMap.values());
  }

  /**
   * Sanitizes names so files and sheet metadata are strictly in English ASCII.
   * If a child has a Hebrew or Unicode name, transliterates or normalizes it.
   */
  public getEnglishSafeName(name: string): string {
    const hebrewToLatin: Record<string, string> = {
      'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z',
      'ח': 'Ch', 'ט': 'T', 'י': 'Y', 'כ': 'K', 'ך': 'K', 'ל': 'L', 'מ': 'M',
      'ם': 'M', 'נ': 'N', 'ן': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P', 'ף': 'P',
      'צ': 'Tz', 'ץ': 'Tz', 'ק': 'K', 'ר': 'R', 'ש': 'Sh', 'ת': 'T'
    };

    let converted = '';
    for (const char of name) {
      if (hebrewToLatin[char]) {
        converted += hebrewToLatin[char];
      } else {
        converted += char;
      }
    }

    const asciiOnly = converted.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 _-]/g, '').trim();
    return asciiOnly || 'Child';
  }

  /**
   * Finds or creates a dedicated Google Sheet for a child inside the KidStock folder.
   */
  public async ensureKidSpreadsheet(
    accessToken: string,
    folderId: string,
    child: ChildProfile
  ): Promise<KidSheetInfo> {
    // 1. Search if sheet already exists in folder (Strictly English name)
    const safeEnglishName = this.getEnglishSafeName(child.name);
    const sheetTitle = `${safeEnglishName} - KidStock Portfolio`;
    const q = encodeURIComponent(
      `'${folderId}' in parents and name = '${sheetTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );

    let spreadsheetId: string | undefined = this.sheetsMap.get(child.id)?.spreadsheetId;
    let spreadsheetUrl: string | undefined = this.sheetsMap.get(child.id)?.spreadsheetUrl;

    if (!spreadsheetId) {
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          const found = searchData.files[0];
          spreadsheetId = found.id;
          spreadsheetUrl = found.webViewLink || `https://docs.google.com/spreadsheets/d/${found.id}/edit`;
        }
      }
    }

    // 2. If not found, create new spreadsheet
    if (!spreadsheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: sheetTitle,
          },
          sheets: [
            { properties: { title: 'Overview', gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: 'Holdings', gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: 'Ledger', gridProperties: { frozenRowCount: 1 } } },
          ],
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        console.error('Sheets API create error:', err);
        throw new Error(`Failed to create spreadsheet for ${child.name}: ${err.error?.message || createRes.statusText}`);
      }

      const createdSheet = await createRes.json();
      spreadsheetId = createdSheet.spreadsheetId;
      spreadsheetUrl = createdSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      // Move into KidStock folder
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ).catch((e) => console.warn('Could not move sheet to KidStock folder', e));
    }

    const info: KidSheetInfo = {
      childId: child.id,
      childName: child.name,
      spreadsheetId: spreadsheetId!,
      spreadsheetUrl: spreadsheetUrl!,
      lastUpdated: new Date().toISOString(),
    };

    this.sheetsMap.set(child.id, info);
    this.persistSheetMap();

    // 3. Guarantee that the required tabs ('Overview', 'Holdings', 'Ledger') exist on the sheet!
    await this.ensureSheetTabsExist(accessToken, spreadsheetId!);

    return info;
  }

  /**
   * If a sheet file was created earlier as a default empty file (only "Sheet1"),
   * this safely creates or renames the tabs to Overview, Holdings, and Ledger.
   */
  private async ensureSheetTabsExist(accessToken: string, spreadsheetId: string) {
    try {
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!metaRes.ok) return;
      const meta = await metaRes.json();
      const existingTitles: string[] = (meta.sheets || []).map((s: any) => s.properties?.title);

      const requests: any[] = [];
      if (!existingTitles.includes('Overview')) {
        // If Sheet1 or another default single sheet exists, rename it to Overview
        if (existingTitles.length === 1 && meta.sheets?.[0]?.properties) {
          const firstSheet = meta.sheets[0].properties;
          requests.push({
            updateSheetProperties: {
              properties: { sheetId: firstSheet.sheetId, title: 'Overview' },
              fields: 'title',
            },
          });
        } else {
          requests.push({ addSheet: { properties: { title: 'Overview' } } });
        }
      }

      if (!existingTitles.includes('Holdings')) {
        requests.push({ addSheet: { properties: { title: 'Holdings' } } });
      }
      if (!existingTitles.includes('Ledger')) {
        requests.push({ addSheet: { properties: { title: 'Ledger' } } });
      }

      if (requests.length > 0) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        });
      }
    } catch (e) {
      console.warn('ensureSheetTabsExist warning:', e);
    }
  }

  /**
   * Appends a transaction atomically to the child's Ledger tab.
   * Uses Google Sheets append API which is serialized on Google servers to prevent write races.
   */
  public async appendTransactionToLedger(
    accessToken: string,
    childId: string,
    tx: TransactionRecord
  ): Promise<boolean> {
    return this.acquireChildLock(childId, async () => {
      const sheetInfo = this.sheetsMap.get(childId);
      if (!sheetInfo) return false;

      await this.ensureSheetTabsExist(accessToken, sheetInfo.spreadsheetId);

      const rowValues = [
        [
          new Date(tx.timestamp).toUTCString(),
          tx.type,
          tx.ticker || '-',
          tx.shares ? Number(tx.shares.toFixed(4)) : '-',
          tx.pricePerShare ? `$${tx.pricePerShare.toFixed(2)}` : '-',
          `$${tx.totalAmount.toFixed(2)}`,
          tx.realizedGainLoss !== undefined ? `$${tx.realizedGainLoss.toFixed(2)}` : '-',
          `$${tx.postBalance.toFixed(2)}`,
          tx.note || '',
        ],
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.spreadsheetId}/values/Ledger!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rowValues,
        }),
      });

      return res.ok;
    });
  }

  /**
   * Synchronizes full state for a single kid into their dedicated Google Sheet:
   * 1. Updates 'Overview' tab
   * 2. Overwrites 'Holdings' tab with latest aggregated values
   * 3. Syncs 'Ledger' rows if needed
   */
  public async syncKidSpreadsheet(
    accessToken: string,
    child: ChildProfile,
    holdings: AggregatedHolding[],
    transactions: TransactionRecord[]
  ): Promise<boolean> {
    return this.acquireChildLock(child.id, async () => {
      const sheetInfo = this.sheetsMap.get(child.id);
      if (!sheetInfo) return false;

      // Always ensure tabs exist before writing ranges
      await this.ensureSheetTabsExist(accessToken, sheetInfo.spreadsheetId);

      // 1. Overview Tab Values
      const overviewValues = [
        ['Property', 'Value'],
        ['Child Name', this.getEnglishSafeName(child.name)],
        ['Avatar', child.avatar],
        ['Current Cash Balance', `$${child.cashBalance.toFixed(2)}`],
        ['Total Deposited (Allowance)', `$${child.totalDeposited.toFixed(2)}`],
        ['Total Withdrawn', `$${child.totalWithdrawn.toFixed(2)}`],
        ['Last Synced', new Date().toUTCString()],
      ];

      // 2. Holdings Tab Values
      const holdingsRows: any[][] = [
        [
          'Symbol',
          'Company Name',
          'Category',
          'Total Shares',
          'Avg Cost / Share',
          'Total Cost ($)',
          'Current Price ($)',
          'Current Value ($)',
          'Unrealized Profit ($)',
          'Return %',
        ],
      ];

      holdings.forEach((h) => {
        holdingsRows.push([
          h.ticker,
          h.companyName,
          h.category.toUpperCase(),
          h.totalShares,
          `$${h.avgBuyPrice.toFixed(2)}`,
          `$${h.totalCost.toFixed(2)}`,
          `$${h.currentPrice.toFixed(2)}`,
          `$${h.currentValue.toFixed(2)}`,
          `${h.unrealizedGainLoss >= 0 ? '+' : ''}$${h.unrealizedGainLoss.toFixed(2)}`,
          `${h.gainLossPercent >= 0 ? '+' : ''}${h.gainLossPercent.toFixed(2)}%`,
        ]);
      });

      // Clear old rows in Holdings if there were more before
      // We can overwrite range A1:J50
      const batchData = [
        {
          range: 'Overview!A1:B7',
          values: overviewValues,
        },
        {
          range: 'Holdings!A1:J100',
          values: holdingsRows,
        },
      ];

      // First clear Holdings to prevent stale rows
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.spreadsheetId}/values/Holdings!A1:J100:clear`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ).catch(() => {});

      // Batch update Overview and Holdings
      const updateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: batchData,
          }),
        }
      );

      if (!updateRes.ok) {
        const errJson = await updateRes.json().catch(() => ({}));
        const errMsg = errJson.error?.message || updateRes.statusText;
        console.error(`Failed to update Overview/Holdings for ${child.name}:`, errMsg);
        throw new Error(`Sheets update failed for ${child.name}: ${errMsg}`);
      }

      // Also ensure Ledger has all transactions
      await this.syncLedgerTab(accessToken, sheetInfo.spreadsheetId, transactions);

      return true;
    });
  }

  private async syncLedgerTab(accessToken: string, spreadsheetId: string, transactions: TransactionRecord[]) {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const ledgerRows: any[][] = [
      [
        'Date & Time',
        'Transaction Type',
        'Ticker',
        'Shares',
        'Price ($)',
        'Total Amount ($)',
        'Realized Gain ($)',
        'Cash After ($)',
        'Note',
      ],
    ];

    sorted.forEach((tx) => {
      ledgerRows.push([
        new Date(tx.timestamp).toUTCString(),
        tx.type,
        tx.ticker || '-',
        tx.shares ? Number(tx.shares.toFixed(4)) : '-',
        tx.pricePerShare ? `$${tx.pricePerShare.toFixed(2)}` : '-',
        `$${tx.totalAmount.toFixed(2)}`,
        tx.realizedGainLoss !== undefined ? `$${tx.realizedGainLoss.toFixed(2)}` : '-',
        `$${tx.postBalance.toFixed(2)}`,
        tx.note || '',
      ]);
    });

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Ledger!A1:I500:clear`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    ).catch(() => {});

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Ledger!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: ledgerRows,
        }),
      }
    ).catch(() => {});
  }

  /**
   * Reads and parses a Kid's spreadsheet to pull latest modifications done directly in Google Sheets.
   */
  public async pullKidSpreadsheet(
    accessToken: string,
    childId: string
  ): Promise<{ cashBalance?: number; lastSynced?: string } | null> {
    const sheetInfo = this.sheetsMap.get(childId);
    if (!sheetInfo) return null;

    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.spreadsheetId}/values/Overview!A1:B7`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const rows = data.values || [];
      const cashRow = rows.find((r: string[]) => r[0] === 'Current Cash Balance');
      let cashBalance: number | undefined;
      if (cashRow && cashRow[1]) {
        const parsed = parseFloat(cashRow[1].replace(/[^0-9.-]+/g, ''));
        if (!isNaN(parsed)) cashBalance = parsed;
      }
      return { cashBalance };
    } catch {
      return null;
    }
  }

  /**
   * Synchronizes general configuration (kid profiles list, app settings)
   * into 'config.json' inside the KidStock folder using Optimistic Concurrency Control (OCC).
   */
  public async syncConfigFile(
    accessToken: string,
    folderId: string,
    familyData: FamilyData,
    configFileId?: string
  ): Promise<{ fileId: string; etag: string }> {
    const configPayload = {
      currencySymbol: familyData.currencySymbol,
      parentEmail: familyData.parentEmail,
      profiles: familyData.profiles.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        createdAt: p.createdAt,
      })),
      sheets: Array.from(this.sheetsMap.entries()).map(([childId, info]) => ({
        childId,
        childName: info.childName,
        spreadsheetId: info.spreadsheetId,
        spreadsheetUrl: info.spreadsheetUrl,
      })),
      version: Date.now(),
    };

    let targetFileId = configFileId;

    if (!targetFileId) {
      // Find config.json
      const q = encodeURIComponent(
        `'${folderId}' in parents and name = 'config.json' and trashed = false`
      );
      const findRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,etag)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (findRes.ok) {
        const found = await findRes.json();
        if (found.files && found.files.length > 0) {
          targetFileId = found.files[0].id;
          this.configEtag = found.files[0].etag;
        }
      }
    }

    if (!targetFileId) {
      // Create config.json
      const metadata = {
        name: 'config.json',
        parents: [folderId],
        mimeType: 'application/json',
        description: 'KidStock General Settings and Family Child Profiles',
      };
      const boundary = '-------314159265358979323846';
      const body =
        `\r\n--${boundary}\r\n` +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(configPayload, null, 2) +
        `\r\n--${boundary}--`;

      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,etag',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );
      const data = await createRes.json();
      this.configEtag = data.etag;
      return { fileId: data.id, etag: data.etag };
    } else {
      // Update config.json with OCC header if available
      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };
      if (this.configEtag) {
        headers['If-Match'] = this.configEtag;
      }

      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=media&fields=id,etag`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(configPayload, null, 2),
        }
      );

      // Handle 412 Precondition Failed (concurrent modification race)
      if (updateRes.status === 412) {
        console.warn('config.json modified elsewhere (OCC race detected). Refreshing ETag...');
        const freshRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${targetFileId}?fields=etag`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          this.configEtag = freshData.etag;
          // Retry write once with latest ETag
          headers['If-Match'] = freshData.etag;
          const retryRes = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=media&fields=id,etag`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify(configPayload, null, 2),
            }
          );
          const data = await retryRes.json();
          this.configEtag = data.etag;
          return { fileId: targetFileId, etag: data.etag };
        }
      }

      const data = await updateRes.json();
      this.configEtag = data.etag;
      return { fileId: targetFileId, etag: data.etag };
    }
  }
}

export const googleSheetsPerKidService = new GoogleSheetsPerKidService();
