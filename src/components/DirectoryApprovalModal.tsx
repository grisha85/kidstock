import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { googleDriveFolderService } from '../services/googleDriveFolderService';
import { soundService } from '../services/soundService';
import { FolderLock, ShieldCheck, CheckCircle2, X, Lock, Ban } from 'lucide-react';

interface DirectoryApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
}

export const DirectoryApprovalModal: React.FC<DirectoryApprovalModalProps> = ({
  isOpen,
  onClose,
  onApproved,
}) => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const [folderName, setFolderName] = useState('KidStock');

  if (!isOpen) return null;

  const handleApprove = () => {
    soundService.playTradeSuccess();
    googleDriveFolderService.setDirectoryApproval(true);
    onApproved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 text-left rtl:text-right relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundService.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl shrink-0 shadow-xs">
            <FolderLock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {isHe ? 'אישור הרשאה לתיקייה ייעודית בלבד ב-Google Drive' : 'Strict Google Drive Folder Permission'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isHe
                ? 'שליטה מלאה והגנה על שאר הקבצים האישיים שלך'
                : 'Full privacy control: KidStock only accesses this exact folder'}
            </p>
          </div>
        </div>

        {/* Highlight Banner on How Google Security Works */}
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 mb-4 text-xs text-blue-950 leading-relaxed space-y-1">
          <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {isHe
                ? 'איך גוגל מבטיחה שלאפליקציה אין גישה לשום קובץ אחר?'
                : 'How does Google guarantee KidStock cannot touch other files?'}
            </span>
          </div>
          <p className="text-blue-800 text-[11px] sm:text-xs">
            {isHe
              ? 'גוגל מפעילה מנגנון הרשאה קפדני (drive.file). האפליקציה מוגבלת טכנולוגית אך ורק לקבצים ולתיקיות שהיא עצמה יוצרת. שרתי גוגל חוסמים מיידית כל ניסיון גישה לשאר קבצי ה-Drive שלך!'
              : 'Google enforces the strict "drive.file" security scope. KidStock is physically restricted by Google to only files and folders it creates itself. Google servers automatically block any attempt to view your other Drive files.'}
          </p>
        </div>

        {/* Target Directory Specifier Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isHe ? '📁 התיקייה הייעודית היחידה שתאושר:' : '📁 The ONLY folder KidStock is permitted to use:'}
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-blue-200 font-mono text-sm font-bold text-blue-700 shadow-2xs">
            <span>Google Drive &gt; </span>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              className="bg-blue-50/70 border-b-2 border-blue-500 text-blue-900 font-bold px-2 py-0.5 rounded focus:outline-hidden w-32 text-center"
            />
            <span className="text-xs text-slate-400 font-sans font-normal ml-auto">
              {isHe ? '(תיקייה פרטית)' : '(Private Folder)'}
            </span>
          </div>
        </div>

        {/* Side-by-Side Permissions: Allowed vs Blocked */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
          {/* ALLOWED */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="font-extrabold flex items-center gap-1.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isHe ? 'מה מותר בתיקיית KidStock:' : 'Allowed in this folder only:'}</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-emerald-900 list-disc list-inside">
              <li>
                {isHe
                  ? `יצירת תיקיית "${folderName}" ב-Google Drive האישי שלך`
                  : `Create the "${folderName}" directory in your Drive`}
              </li>
              <li>
                {isHe
                  ? 'שמירת יתרות המזומן ויומן הקניות של הילדים'
                  : 'Save family portfolio balances and stock transactions'}
              </li>
              <li>
                {isHe
                  ? 'סנכרון בזמן אמת בין המכשירים של המשפחה'
                  : 'Live cloud sync across family devices'}
              </li>
            </ul>
          </div>

          {/* BLOCKED & PROTECTED */}
          <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-950 space-y-2">
            <div className="font-extrabold flex items-center gap-1.5 text-rose-800 text-xs">
              <Ban className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{isHe ? 'חסום לחלוטין (מוגן ע״י גוגל):' : 'Strictly Blocked by Google:'}</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-rose-900 list-disc list-inside">
              <li className="flex items-start gap-1">
                <span>
                  {isHe
                    ? 'אפס גישה לתמונות, מסמכים או קבצים אחרים'
                    : 'Zero access to other folders, photos, or files'}
                </span>
              </li>
              <li className="flex items-start gap-1">
                <span>
                  {isHe
                    ? 'אפס גישה למיילים (Gmail) או לאנשי קשר'
                    : 'Zero access to emails (Gmail) or personal data'}
                </span>
              </li>
              <li className="flex items-start gap-1">
                <span>
                  {isHe
                    ? 'אי אפשר לקרוא או לשנות קבצים מחוץ לתיקייה'
                    : 'Impossible to modify anything outside /KidStock'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            {isHe ? 'ביטול' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleApprove}
            className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>
              {isHe
                ? `אני מאשר: גש אך ורק לתיקיית ${folderName} ב-Drive`
                : `I Approve: Allow Access ONLY to /${folderName}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
