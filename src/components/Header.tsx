import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChildProfile } from '../types';
import { AuthUser } from '../services/authService';
import { soundService } from '../services/soundService';
import { Volume2, VolumeX, Users, ChevronDown, Check, LogOut } from 'lucide-react';

interface HeaderProps {
  currentChild: ChildProfile | null;
  profiles: ChildProfile[];
  onSelectChild: (childId: string) => void;
  onOpenParentPortal: () => void;
  isParentMode: boolean;
  onExitParentMode: () => void;
  currentUser?: AuthUser | null;
  onOpenSignIn?: () => void;
  onSignOut?: () => void;
  onOpenHowItWorks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentChild,
  profiles,
  onSelectChild,
  onOpenParentPortal,
  isParentMode,
  onExitParentMode,
  currentUser,
  onOpenSignIn,
  onSignOut,
  onOpenHowItWorks,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isSoundMuted, setIsSoundMuted] = useState(soundService.getMuted());
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);

  const toggleSound = () => {
    const muted = soundService.toggleMute();
    setIsSoundMuted(muted);
    if (!muted) {
      soundService.playClick();
    }
  };

  const handleLanguageToggle = () => {
    soundService.playClick();
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 shrink-0 group cursor-pointer" dir="ltr">
          <div className="w-10 h-10 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/favicon.png"
              alt="KidStock"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              KidStock
            </span>
            {isParentMode && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                {t.nav.parentPortal}
              </span>
            )}
          </div>
        </div>

        {/* Center: Kid Profile Switcher (Only in Kid Mode) */}
        {!isParentMode && currentChild && (
          <div className="relative shrink-0">
            <button
              onClick={() => {
                soundService.playClick();
                setIsChildDropdownOpen(!isChildDropdownOpen);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all shadow-xs group"
            >
              <span className="text-base sm:text-lg">{currentChild.avatar}</span>
              <div className="text-left rtl:text-right">
                <span className="font-bold text-xs sm:text-sm text-slate-800 block leading-tight">
                  {currentChild.name}
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-semibold block leading-none">
                  ${currentChild.cashBalance.toFixed(2)}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {/* Dropdown Menu */}
            {isChildDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {t.nav.switchKid}
                </div>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundService.playClick();
                      onSelectChild(p.id);
                      setIsChildDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      p.id === currentChild.id ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.avatar}</span>
                      <span>{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-medium">
                        ${p.cashBalance.toFixed(2)}
                      </span>
                      {p.id === currentChild.id && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  </button>
                ))}

                {/* Direct Parent Portal Switcher Option */}
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setIsChildDropdownOpen(false);
                    onOpenParentPortal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-amber-50 text-amber-900 font-bold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👨‍💼</span>
                    <span>{t.nav.parentPortal}</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-semibold">
                    Broker
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Actions: Tutorial, Sound, Language, Auth, Parent Portal */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Tutorial Button (Always accessible in Kid Mode) */}
          {!isParentMode && onOpenHowItWorks && (
            <button
              onClick={() => {
                soundService.playClick();
                onOpenHowItWorks();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all shadow-2xs hover:scale-105"
              title={t.howItWorks.buttonLabel}
            >
              <span className="text-xs">🎓</span>
              <span>{t.howItWorks.buttonLabel}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isSoundMuted ? t.nav.soundOff : t.nav.soundOn}
            className={`p-1.5 rounded-xl transition-all ${
              isSoundMuted ? 'text-slate-400 hover:bg-slate-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Language Toggle (EN / HE) */}
          <button
            onClick={handleLanguageToggle}
            className="px-2 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          >
            <span>{language === 'en' ? 'EN' : 'עב'}</span>
          </button>

          {/* Google SSO Compact Pill */}
          {currentUser ? (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  soundService.playClick();
                  onOpenSignIn?.();
                }}
                title={`Signed in as ${currentUser.email} (${t.login.googleSignIn})`}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="max-w-[75px] sm:max-w-[100px] truncate">{currentUser.email.split('@')[0]}</span>
              </button>

              <button
                onClick={() => {
                  soundService.playClick();
                  onSignOut?.();
                }}
                title={t.nav.signOut}
                aria-label={t.nav.signOut}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                soundService.playClick();
                onOpenSignIn?.();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
          )}

          {/* Exit Parent Mode Button (only shown when inside Parent Mode) */}
          {isParentMode && (
            <button
              onClick={() => {
                soundService.playClick();
                onExitParentMode();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.nav.exitParent}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
