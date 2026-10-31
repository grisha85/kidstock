import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { authService, AuthUser } from '../services/authService';
import { googleDriveFolderService } from '../services/googleDriveFolderService';
import { soundService } from '../services/soundService';
import { ShieldCheck, Sparkles, ArrowRight, ArrowLeft, RefreshCw, X, LogOut, CheckCircle2, ExternalLink } from 'lucide-react';
import { DirectoryApprovalModal } from './DirectoryApprovalModal';

interface GoogleSignInGateProps {
  onSignedIn: () => void;
  onClose?: () => void;
  currentUser?: AuthUser | null;
}

export const GoogleSignInGate: React.FC<GoogleSignInGateProps> = ({
  onSignedIn,
  onClose,
  currentUser,
}) => {
  const { language, setLanguage } = useLanguage();
  const isHe = language === 'he';

  const [isLoading, setIsLoading] = useState(false);
  const [showConfigPrompt, setShowConfigPrompt] = useState(false);
  const [showDirectoryApprovalModal, setShowDirectoryApprovalModal] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(googleDriveFolderService.getClientId());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animated connection progress during first sign-in
  const [connectionStage, setConnectionStage] = useState<
    'idle' | 'authenticating' | 'connecting_spreadsheets' | 'syncing_ledger' | 'ready'
  >('idle');

  const runSpreadsheetConnectionFlow = async (email: string, name?: string) => {
    try {
      // Stage 1: Authenticating
      setConnectionStage('authenticating');
      soundService.playClick();
      await new Promise((r) => setTimeout(r, 600));

      // Stage 2: Creating and connecting spreadsheets
      setConnectionStage('connecting_spreadsheets');
      await googleDriveFolderService.initializeKidStockFolder(email);
      await new Promise((r) => setTimeout(r, 800));

      // Stage 3: Syncing ledger
      setConnectionStage('syncing_ledger');
      await authService.signInWithGoogle(email, name);
      await googleDriveFolderService.pushToDrive();
      await new Promise((r) => setTimeout(r, 700));

      // Stage 4: Ready
      setConnectionStage('ready');
      soundService.playTradeSuccess();
      await new Promise((r) => setTimeout(r, 600));

      onSignedIn();
    } catch (err: any) {
      console.warn('Connection flow error', err);
      await authService.signInWithGoogle(email, name);
      onSignedIn();
    } finally {
      setIsLoading(false);
      setConnectionStage('idle');
    }
  };

  const proceedWithGoogleSignIn = async () => {
    setErrorMsg(null);
    const clientId = googleDriveFolderService.getClientId();

    // If Google Client ID is configured and Google Identity Services is available, run real OAuth
    if (clientId && window.google?.accounts?.oauth2) {
      setIsLoading(true);
      try {
        const res = await googleDriveFolderService.requestOneClickAuth();
        if (res.success) {
          const info = googleDriveFolderService.getConnectionInfo();
          await runSpreadsheetConnectionFlow(info.userEmail || 'parent@gmail.com');
          return;
        } else {
          setErrorMsg(res.message);
        }
      } catch (e: any) {
        console.warn('Real Google OAuth failed, showing quick sign-in', e);
        setErrorMsg('Google OAuth popup was closed or origin was not authorized.');
      }
      setIsLoading(false);
    }

    // Otherwise, show the configuration prompt so user can connect either OAuth or Google Apps Script
    setShowConfigPrompt(true);
  };

  const handleGoogleSignInClick = () => {
    soundService.playClick();
    if (!googleDriveFolderService.hasDirectoryApproval()) {
      setShowDirectoryApprovalModal(true);
      return;
    }
    proceedWithGoogleSignIn();
  };

  const handleOAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;

    soundService.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    googleDriveFolderService.setClientId(clientIdInput.trim());

    if (!window.google?.accounts?.oauth2) {
      setErrorMsg('Google Identity Services script is still loading. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await googleDriveFolderService.requestOneClickAuth(clientIdInput.trim());
      if (res.success) {
        const info = googleDriveFolderService.getConnectionInfo();
        await runSpreadsheetConnectionFlow(info.userEmail || 'parent@gmail.com');
      } else {
        setErrorMsg(res.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not launch Google authentication');
      setIsLoading(false);
    }
  };

  const handleGuestEntry = () => {
    soundService.playClick();
    authService.enterAsGuest();
    onSignedIn();
  };

  const handleSignOut = () => {
    soundService.playClick();
    authService.signOut();
    setShowConfigPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col items-center justify-center p-4 overflow-y-auto select-none">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Close (if open as modal) & Language Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div>
          {onClose && (
            <button
              onClick={() => {
                soundService.playClick();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>{isHe ? 'סגור' : 'Close'}</span>
            </button>
          )}
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            setLanguage(language === 'en' ? 'he' : 'en');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-colors"
        >
          <span>{language === 'en' ? '🇬🇧 English' : '🇮🇱 עברית'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/20 relative z-10 animate-in zoom-in-95 duration-200 text-slate-900 text-left rtl:text-right my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/favicon.png"
            alt="KidStock Logo"
            className="w-20 h-20 object-contain drop-shadow-md mb-3 transform hover:scale-105 transition-transform"
          />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            KidStock
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {isHe
              ? 'מסחר חינוכי במניות לילדים עם ההורים כברוקר'
              : 'Educational Stock Market for Kids with Parents as Broker'}
          </p>
        </div>

        {/* CONNECTION PROGRESS STATE (WHEN SIGNING IN) */}
        {connectionStage !== 'idle' ? (
          <div className="py-6 space-y-5 animate-in fade-in text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl">
              {connectionStage === 'ready' ? '🎉' : '🔄'}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {connectionStage === 'authenticating' &&
                  (isHe ? 'מאמת חשבון Google...' : 'Authenticating Google Account...')}
                {connectionStage === 'connecting_spreadsheets' &&
                  (isHe ? 'מחבר תיקיית KidStock וגיליונות...' : 'Connecting KidStock Spreadsheet & Folder...')}
                {connectionStage === 'syncing_ledger' &&
                  (isHe ? 'מסנכרן נתוני תיק משפחתי...' : 'Syncing Family Portfolio Ledger...')}
                {connectionStage === 'ready' &&
                  (isHe ? 'מוכן! נכנס לאפליקציה...' : 'Ready! Launching KidStock...')}
              </h3>
              <p className="text-xs text-slate-500">
                {isHe
                  ? 'מגדיר סנכרון מאובטח בתיקייה הייעודית ב-Google Drive שלכם'
                  : 'Setting up secure sync inside your private KidStock directory'}
              </p>
            </div>

            {/* Step list */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-left rtl:text-right font-semibold">
              <div className="flex items-center gap-2.5">
                {connectionStage === 'authenticating' ? (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className={connectionStage === 'authenticating' ? 'text-blue-900 font-bold' : 'text-slate-600'}>
                  1. {isHe ? 'אימות חשבון Google' : 'Google Account Verified'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {connectionStage === 'connecting_spreadsheets' ? (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : connectionStage === 'authenticating' ? (
                  <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className={connectionStage === 'connecting_spreadsheets' ? 'text-blue-900 font-bold' : 'text-slate-600'}>
                  2. {isHe ? 'יצירת תיקיית KidStock וגיליון מניות' : 'KidStock Directory & Spreadsheet Connected'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {connectionStage === 'syncing_ledger' ? (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : connectionStage === 'ready' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={connectionStage === 'syncing_ledger' ? 'text-blue-900 font-bold' : 'text-slate-600'}>
                  3. {isHe ? 'סנכרון יתרות המזומן ועסקאות הילדים' : 'Family Accounts & Stock Ledger Synced'}
                </span>
              </div>
            </div>
          </div>
        ) : currentUser ? (
          /* CURRENTLY LOGGED IN STATE (IF OPENED FROM HEADER) */
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-900">
                  {isHe ? 'מחובר עם חשבון Google' : 'Signed in with Google Account'}
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-800 break-all">
                {currentUser.email}
              </div>
              <div className="text-xs text-slate-500">
                {isHe ? 'הורה / ברוקר:' : 'Parent Broker:'} <strong>{currentUser.name}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playTradeSuccess();
                onSignedIn();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>{isHe ? 'המשך ללוח המניות 🚀' : 'Continue to Stock Dashboard 🚀'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isHe ? 'התנתק מחשבון זה' : 'Sign Out / Switch Account'}</span>
            </button>
          </div>
        ) : !showConfigPrompt ? (
          /* STANDARD GOOGLE SSO LANDING */
          <div className="space-y-4">
            {/* Feature highlight pills */}
            <div className="space-y-2 mb-2">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                <span className="text-base shrink-0">📈</span>
                <span>
                  {isHe
                    ? 'מסחר וירטואלי במחירי שוק אמיתיים (שברי מניות)'
                    : 'Virtual paper trading against real-time market prices'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                <span className="text-base shrink-0">📁</span>
                <span>
                  {isHe
                    ? 'סנכרון אוטומטי בגיליון ובתיקיית KidStock ב-Google Drive'
                    : 'Automatic sync to your private KidStock Drive folder & sheets'}
                </span>
              </div>
            </div>

            {/* Google SSO Button */}
            <button
              onClick={handleGoogleSignInClick}
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm sm:text-base border-2 border-slate-200 hover:border-slate-300 shadow-md transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              {/* Official Google G Logo SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isHe ? 'התחבר עם חשבון Google' : 'Sign in with Google'}</span>
            </button>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            {/* Privacy Guarantee Pill */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold text-center pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isHe
                  ? 'גישה ייעודית בלבד לתיקיית KidStock (ללא גישה לקבצים אחרים)'
                  : 'Strictly isolated to private KidStock folder (drive.file scope)'}
              </span>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-slate-400 text-xs font-bold uppercase">
                {isHe ? 'או' : 'or'}
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Guest / Offline Mode Button */}
            <button
              onClick={handleGuestEntry}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{isHe ? 'המשך כאורח (מצב הדגמה מקומי)' : 'Continue as Guest (Local Offline Demo)'}</span>
              {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          /* GOOGLE OAUTH & APPS SCRIPT SETUP PROMPT */
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center mb-1">
              <span className="text-sm font-extrabold text-slate-900 block">
                {isHe ? 'חיבור מאובטח ל-Google Drive' : 'Connect Your Google Drive'}
              </span>
              <span className="text-xs text-slate-500">
                {isHe
                  ? 'בחר כיצד לחבר את ה-Drive כדי שהתיקייה תיווצר פיזית בחשבונך:'
                  : 'Choose how to connect so the KidStock folder is physically created in your Drive:'}
              </span>
            </div>

            {/* Direct OAuth Form */}
            <form onSubmit={handleOAuthSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                <p className="leading-relaxed">
                  {isHe
                    ? 'הזן את ה-Client ID של Google Cloud. ייפתח חלון ההתחברות הרשמי של גוגל, ותיקיית KidStock תיווצר פיזית ב-Drive שלך!'
                    : "Enter your Google Cloud Web Client ID. Google's official popup will launch, authorize access, and physically create the 'KidStock' folder in your personal Drive!"}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Google OAuth 2.0 Web Client ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder="123456789-abcdef.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
                <div className="mt-1 flex justify-between items-center text-[11px]">
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Create Client ID in Google Cloud Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !clientIdInput.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isHe ? 'הפעל התחברות Google וצור תיקייה 🚀' : 'Launch Google Sign-In & Create Store 🚀'}</span>
              </button>
            </form>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowConfigPrompt(false)}
              className="w-full py-1 text-xs font-bold text-slate-500 hover:text-slate-800 text-center block"
            >
              {isHe ? '← חזרה' : '← Back'}
            </button>
          </div>
        )}
      </div>

      {/* Explicit Directory Approval Modal */}
      <DirectoryApprovalModal
        isOpen={showDirectoryApprovalModal}
        onClose={() => setShowDirectoryApprovalModal(false)}
        onApproved={() => {
          setShowDirectoryApprovalModal(false);
          proceedWithGoogleSignIn();
        }}
      />
    </div>
  );
};
