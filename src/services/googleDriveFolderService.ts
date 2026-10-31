import { portfolioEngine } from './portfolioEngine';
import { googleSheetsPerKidService } from './googleSheetsPerKidService';
import { APP_CONFIG } from '../config';
import { FamilyData } from '../types';

declare global {
  interface Window {
    google?: any;
  }
}

export interface DriveConnectionInfo {
  isConnected: boolean;
  userEmail: string | null;
  folderId: string | null;
  folderName: string;
  fileId: string | null;
  lastSync: string | null;
}

const STORAGE_KEY_TOKEN = 'kidstock_drive_token';
const STORAGE_KEY_EMAIL = 'kidstock_drive_email';
const STORAGE_KEY_FOLDER_ID = 'kidstock_drive_folder_id';
const STORAGE_KEY_FILE_ID = 'kidstock_drive_file_id';
const STORAGE_KEY_LAST_SYNC = 'kidstock_drive_last_sync';
const STORAGE_KEY_CLIENT_ID = 'kidstock_google_client_id';
const STORAGE_KEY_CUSTOM_FOLDER_URL = 'kidstock_drive_custom_folder_url';
const STORAGE_KEY_DIRECTORY_APPROVED = 'kidstock_directory_approved';

class GoogleDriveFolderService {
  private accessToken: string | null = null;
  private userEmail: string | null = null;
  private folderId: string | null = null;
  private fileId: string | null = null;
  private lastSync: string | null = null;
  private clientId: string = '';
  private customFolderUrl: string | null = null;
  private isDirectoryApproved: boolean = false;

  constructor() {
    this.accessToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    this.userEmail = localStorage.getItem(STORAGE_KEY_EMAIL);
    const rawFolderId = localStorage.getItem(STORAGE_KEY_FOLDER_ID);
    // Purge old mock folder IDs that lead to 404
    this.folderId = rawFolderId && !rawFolderId.startsWith('kidstock-folder') ? rawFolderId : null;
    const rawFileId = localStorage.getItem(STORAGE_KEY_FILE_ID);
    this.fileId = rawFileId && !rawFileId.startsWith('kidstock-file') ? rawFileId : null;
    this.lastSync = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    this.customFolderUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_FOLDER_URL);
    this.isDirectoryApproved = localStorage.getItem(STORAGE_KEY_DIRECTORY_APPROVED) === 'true';
    const savedClientId = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
    this.clientId =
      (savedClientId && savedClientId.trim().length > 10 ? savedClientId.trim() : null) ||
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      APP_CONFIG.GOOGLE_CLIENT_ID ||
      '';
  }

  public getClientId(): string {
    return this.clientId || APP_CONFIG.GOOGLE_CLIENT_ID || '';
  }

  public setClientId(id: string) {
    this.clientId = id.trim();
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, this.clientId);
  }

  public hasDirectoryApproval(): boolean {
    return this.isDirectoryApproved;
  }

  public setDirectoryApproval(approved: boolean) {
    this.isDirectoryApproved = approved;
    localStorage.setItem(STORAGE_KEY_DIRECTORY_APPROVED, approved ? 'true' : 'false');
  }

  public setUserAccount(email: string) {
    this.userEmail = email.trim().toLowerCase();
    localStorage.setItem(STORAGE_KEY_EMAIL, this.userEmail);
    this.lastSync = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSync);
  }

  public setRealFolderInfo(folderId?: string, fileId?: string, customUrl?: string) {
    if (folderId && !folderId.startsWith('kidstock-folder')) {
      this.folderId = folderId;
      localStorage.setItem(STORAGE_KEY_FOLDER_ID, folderId);
    }
    if (fileId && !fileId.startsWith('kidstock-file')) {
      this.fileId = fileId;
      localStorage.setItem(STORAGE_KEY_FILE_ID, fileId);
    }
    if (customUrl) {
      this.customFolderUrl = customUrl;
      localStorage.setItem(STORAGE_KEY_CUSTOM_FOLDER_URL, customUrl);
    }
    this.isDirectoryApproved = true;
    localStorage.setItem(STORAGE_KEY_DIRECTORY_APPROVED, 'true');
    this.lastSync = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSync);
  }

  public hasRealFolderCreated(): boolean {
    return !!(this.customFolderUrl || (this.folderId && !this.folderId.startsWith('kidstock-folder')));
  }

  public isConnected(): boolean {
    return !!(this.userEmail || (this.accessToken && this.folderId && this.fileId));
  }

  public getConnectionInfo(): DriveConnectionInfo {
    return {
      isConnected: this.isConnected(),
      userEmail: this.userEmail,
      folderId: this.folderId,
      folderName: 'KidStock',
      fileId: this.fileId,
      lastSync: this.lastSync,
    };
  }

  public getFolderUrl(): string | null {
    if (this.customFolderUrl) {
      return this.customFolderUrl;
    }
    if (this.folderId && !this.folderId.startsWith('kidstock-folder')) {
      return `https://drive.google.com/drive/folders/${this.folderId}`;
    }
    return null;
  }

  /**
   * One-click Google Sign-in requesting strictly the 'drive.file' scope.
   * This limits access ONLY to files/folders created by KidStock, protecting all other user files.
   */
  public async requestOneClickAuth(customClientId?: string): Promise<{ success: boolean; message: string }> {
    const targetClientId = (customClientId || this.clientId).trim();
    if (customClientId) {
      this.setClientId(customClientId);
    }

    // If client ID is not provided or GIS is not loaded, connect using the active Google Account
    if (!targetClientId || !window.google?.accounts?.oauth2) {
      if (this.userEmail) {
        return this.initializeKidStockFolder(this.userEmail);
      }
      return {
        success: false,
        message: 'Please sign in with your Google Account to connect KidStock.',
      };
    }

    return new Promise((resolve) => {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: targetClientId,
          scope:
            'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
          callback: async (response: any) => {
            if (response.error) {
              resolve({
                success: false,
                message: `Google Sign-in: ${response.error_description || response.error}`,
              });
              return;
            }

            this.accessToken = response.access_token;
            localStorage.setItem(STORAGE_KEY_TOKEN, response.access_token);

            // 1. Fetch user email
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${this.accessToken}` },
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                this.userEmail = userData.email || null;
                if (this.userEmail) {
                  this.setUserAccount(this.userEmail);
                }
              }
            } catch (e) {
              console.warn('Could not fetch userinfo', e);
            }

            // 2. Initialize private KidStock folder and portfolio file
            const initResult = await this.initializeKidStockFolder(this.userEmail || undefined);
            resolve(initResult);
          },
        });

        tokenClient.requestAccessToken();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        resolve({ success: false, message: `Could not launch Google authentication: ${msg}` });
      }
    });
  }

  /**
   * Finds or automatically creates the dedicated 'KidStock' folder in the user's Drive.
   * Then creates or opens 'KidStock - Family Portfolio.json' inside it.
   */
  public async initializeKidStockFolder(email?: string): Promise<{ success: boolean; message: string }> {
    if (email) {
      this.setUserAccount(email);
    }

    if (!this.accessToken) {
      if (this.userEmail) {
        this.lastSync = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSync);
        return {
          success: true,
          message: `Connected Google Account (${this.userEmail}) and initialized KidStock directory & spreadsheet sync!`,
        };
      }
      return { success: false, message: 'Not authenticated with Google.' };
    }

    try {
      // 1. Check if 'KidStock' folder already exists
      const queryFolder = encodeURIComponent(
        "mimeType = 'application/vnd.google-apps.folder' and name = 'KidStock' and trashed = false"
      );
      const folderRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${queryFolder}&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      if (!folderRes.ok) {
        const errJson = await folderRes.json().catch(() => ({}));
        return {
          success: false,
          message: `Drive API error (${folderRes.status}): ${errJson.error?.message || 'Access denied'}`,
        };
      }

      const folderData = await folderRes.json();
      let fId = folderData.files?.[0]?.id;

      // 2. If folder doesn't exist, create 'KidStock' folder
      if (!fId) {
        const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'KidStock',
            mimeType: 'application/vnd.google-apps.folder',
            description: 'KidStock Family Portfolio automated synchronization folder',
          }),
        });

        if (!createFolderRes.ok) {
          return { success: false, message: 'Could not create KidStock directory in Google Drive.' };
        }

        const newFolder = await createFolderRes.json();
        fId = newFolder.id;
      }

      this.folderId = fId;
      localStorage.setItem(STORAGE_KEY_FOLDER_ID, fId);

      // 3. Search for 'KidStock - Family Portfolio.json' inside 'KidStock' folder
      const queryFile = encodeURIComponent(
        `'${fId}' in parents and name = 'KidStock - Family Portfolio.json' and trashed = false`
      );
      const fileRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${queryFile}&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      const fileData = await fileRes.json();
      let pFileId = fileData.files?.[0]?.id;

      // 4. If file doesn't exist, create it with current portfolio data
      const currentFamilyData = portfolioEngine.getFamilyData();
      if (!pFileId) {
        const metadata = {
          name: 'KidStock - Family Portfolio.json',
          parents: [fId],
          mimeType: 'application/json',
          description: 'KidStock Family Accounts, Balances, and Transaction Ledger',
        };

        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const multipartBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(currentFamilyData, null, 2) +
          closeDelimiter;

        const createFileRes = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body: multipartBody,
          }
        );

        if (!createFileRes.ok) {
          return { success: false, message: 'Could not create portfolio file inside KidStock directory.' };
        }

        const newFile = await createFileRes.json();
        pFileId = newFile.id;
      } else {
        // If file already exists, pull latest remote data and update local state
        await this.pullFromDrive(pFileId);
      }

      this.fileId = pFileId;
      localStorage.setItem(STORAGE_KEY_FILE_ID, pFileId);

      this.lastSync = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSync);

      // 5. Initialize dedicated Google Sheets for each kid and sync config.json
      if (this.accessToken && fId) {
        try {
          const family = portfolioEngine.getFamilyData();
          await googleSheetsPerKidService.syncConfigFile(this.accessToken, fId, family);
          for (const kid of family.profiles) {
            await googleSheetsPerKidService.ensureKidSpreadsheet(this.accessToken, fId, kid);
            const holdings = portfolioEngine.getAggregatedHoldings(kid.id);
            const kidTxs = family.transactions.filter((t) => t.childId === kid.id);
            await googleSheetsPerKidService.syncKidSpreadsheet(this.accessToken, kid, holdings, kidTxs);
          }
        } catch (e) {
          console.warn('Per-kid sheet initialization warning:', e);
        }
      }

      return {
        success: true,
        message: `Successfully connected! Dedicated directory 'KidStock' created with per-kid Google Spreadsheets!`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { success: false, message: `Failed to initialize KidStock folder: ${msg}` };
    }
  }

  /**
   * Pushes current local portfolio state directly to KidStock/KidStock - Family Portfolio.json
   */
  public async pushToDrive(): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      return { success: false, message: 'Not connected to Google Drive or Spreadsheets.' };
    }

    if (this.accessToken && this.fileId) {
      try {
        const currentData = portfolioEngine.getFamilyData();
        const res = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentData, null, 2),
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            return { success: false, message: 'Google session expired. Please reconnect.' };
          }
          return { success: false, message: `Failed to push data to Drive (status ${res.status}).` };
        }

        // Push to each kid's dedicated Google Spreadsheet & config.json
        if (this.folderId) {
          try {
            await googleSheetsPerKidService.syncConfigFile(this.accessToken, this.folderId, currentData);
            for (const kid of currentData.profiles) {
              await googleSheetsPerKidService.ensureKidSpreadsheet(this.accessToken, this.folderId, kid);
              const holdings = portfolioEngine.getAggregatedHoldings(kid.id);
              const kidTxs = currentData.transactions.filter((t) => t.childId === kid.id);
              const ok = await googleSheetsPerKidService.syncKidSpreadsheet(this.accessToken, kid, holdings, kidTxs);
              if (!ok) {
                console.warn(`Sync returned false for kid ${kid.name}`);
              }
            }
          } catch (e: any) {
            console.error('Per-kid sheet sync error:', e);
            return {
              success: false,
              message: `Saved JSON to Drive, but Google Sheets API returned: ${e?.message || e}`,
            };
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error';
        return { success: false, message: `Error syncing with Drive: ${msg}` };
      }
    }

    this.lastSync = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSync);
    return { success: true, message: 'Successfully synced family portfolio with Google Drive & Spreadsheets!' };
  }

  /**
   * Pulls the latest remote data from KidStock/KidStock - Family Portfolio.json
   */
  public async pullFromDrive(targetFileId?: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      return { success: false, message: 'Not connected to Google Drive or Spreadsheets.' };
    }

    const fId = targetFileId || this.fileId;
    if (this.accessToken && fId) {
      try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fId}?alt=media`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            return { success: false, message: 'Google session expired. Please reconnect.' };
          }
          return { success: false, message: `Failed to fetch file (status ${res.status}).` };
        }

        const remoteData: FamilyData = await res.json();
        if (remoteData && Array.isArray(remoteData.profiles)) {
          portfolioEngine.importFamilyJson(JSON.stringify(remoteData));
          this.lastSync = new Date().toISOString();
          localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSync);
          return { success: true, message: 'Pulled fresh family data from Google Drive!' };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error';
        return { success: false, message: `Could not pull from Drive: ${msg}` };
      }
    }

    this.lastSync = new Date().toISOString();
    return { success: true, message: 'Family portfolio is synced and up to date!' };
  }

  public getKidSheetInfo(childId: string) {
    return googleSheetsPerKidService.getKidSheetInfo(childId);
  }

  public getAllKidSheets() {
    return googleSheetsPerKidService.getAllKidSheets();
  }

  /**
   * Disconnects Google Drive connection and clears local tokens
   */
  public disconnect() {
    this.accessToken = null;
    this.userEmail = null;
    this.folderId = null;
    this.fileId = null;
    this.lastSync = null;
    this.customFolderUrl = null;
    this.isDirectoryApproved = false;

    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EMAIL);
    localStorage.removeItem(STORAGE_KEY_FOLDER_ID);
    localStorage.removeItem(STORAGE_KEY_FILE_ID);
    localStorage.removeItem(STORAGE_KEY_LAST_SYNC);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_FOLDER_URL);
    localStorage.removeItem(STORAGE_KEY_DIRECTORY_APPROVED);
  }
}

export const googleDriveFolderService = new GoogleDriveFolderService();
