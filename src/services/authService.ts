import { googleDriveFolderService } from './googleDriveFolderService';
import { portfolioEngine } from './portfolioEngine';

export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
  role: 'parent' | 'kid';
  signedInAt: string;
}

const STORAGE_KEY_USER = 'kidstock_auth_user';
const STORAGE_KEY_GUEST = 'kidstock_guest_mode';

class AuthService {
  private user: AuthUser | null = null;
  private isGuest: boolean = false;
  private listeners: Array<(user: AuthUser | null) => void> = [];

  constructor() {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch {
        this.user = null;
      }
    }
    this.isGuest = localStorage.getItem(STORAGE_KEY_GUEST) === 'true';
  }

  public getUser(): AuthUser | null {
    return this.user;
  }

  public isAuthenticated(): boolean {
    return this.user !== null || this.isGuest;
  }

  public isGuestMode(): boolean {
    return this.isGuest && !this.user;
  }

  public subscribe(cb: (user: AuthUser | null) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.user));
  }

  /**
   * Completes Google Sign-in:
   * 1. Saves user profile
   * 2. Automatically triggers connection to Google Drive / Spreadsheets
   */
  public async signInWithGoogle(
    email: string,
    name?: string,
    picture?: string
  ): Promise<{ success: boolean; user: AuthUser; message: string }> {
    const displayName = name || email.split('@')[0] || 'Parent Broker';

    const authUser: AuthUser = {
      email: email.trim().toLowerCase(),
      name: displayName,
      picture,
      role: 'parent',
      signedInAt: new Date().toISOString(),
    };

    this.user = authUser;
    this.isGuest = false;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));
    localStorage.removeItem(STORAGE_KEY_GUEST);

    // Update parent email in portfolio data
    portfolioEngine.updateFamilySettings({
      parentEmail: authUser.email,
    });

    // Auto-connect to Google Drive KidStock folder & spreadsheets
    const driveRes = await googleDriveFolderService.initializeKidStockFolder(authUser.email);
    const driveMsg = driveRes.message;

    this.notify();
    return { success: true, user: authUser, message: driveMsg };
  }

  /**
   * Continue as guest without signing in
   */
  public enterAsGuest() {
    this.isGuest = true;
    this.user = null;
    localStorage.setItem(STORAGE_KEY_GUEST, 'true');
    localStorage.removeItem(STORAGE_KEY_USER);
    this.notify();
  }

  /**
   * Sign out
   */
  public signOut() {
    this.user = null;
    this.isGuest = false;
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_GUEST);
    googleDriveFolderService.disconnect();
    this.notify();
  }
}

export const authService = new AuthService();
