import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { FamilyData } from '../types';
import { portfolioEngine } from '../services/portfolioEngine';
import { googleDriveFolderService } from '../services/googleDriveFolderService';
import { soundService } from '../services/soundService';
import {
  Unlock,
  PlusCircle,
  MinusCircle,
  UserPlus,
  Users,
  History,
  FileSpreadsheet,
  Settings,
  Download,
  CheckCircle,
  FolderCheck,
  ExternalLink,
  ShieldCheck,
  LogOut,
  FolderLock,
  AlertTriangle,
} from 'lucide-react';
import { StockLogo } from './StockLogo';
import { DirectoryApprovalModal } from './DirectoryApprovalModal';

interface ParentPortalProps {
  familyData: FamilyData;
  onClose: () => void;
  onDataUpdated: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  familyData,
  onClose,
  onDataUpdated,
}) => {
  const { t, language } = useLanguage();

  // Active portal tab
  const [activeTab, setActiveTab] = useState<'vault' | 'kids' | 'ledger' | 'sync' | 'settings'>('vault');

  // Vault form state
  const [selectedChildId, setSelectedChildId] = useState<string>(familyData.profiles[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState<string>('20.00');
  const [depositNote, setDepositNote] = useState<string>('Allowance from Parent');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5.00');
  const [withdrawNote, setWithdrawNote] = useState<string>('Physical cash out for store');
  const [vaultFeedback, setVaultFeedback] = useState<string | null>(null);

  // Add child form state
  const [showAddKidModal, setShowAddKidModal] = useState(false);
  const [newKidName, setNewKidName] = useState('');
  const [newKidEmail, setNewKidEmail] = useState('');
  const [newKidAvatar, setNewKidAvatar] = useState('🚀');
  const [newKidCash, setNewKidCash] = useState('20.00');

  // Google Drive Automated Directory Sync State
  const [driveConnection, setDriveConnection] = useState(googleDriveFolderService.getConnectionInfo());
  const [clientIdInput, setClientIdInput] = useState(googleDriveFolderService.getClientId());
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [driveSyncMsg, setDriveSyncMsg] = useState<string | null>(null);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);

  const handleConnectGoogleDrive = async () => {
    if (!googleDriveFolderService.hasDirectoryApproval()) {
      setIsApprovalModalOpen(true);
      return;
    }

    setIsDriveSyncing(true);
    setDriveSyncMsg('Connecting to Google Drive & initializing KidStock folder...');
    const user = portfolioEngine.getFamilyData().parentEmail || 'parent@gmail.com';
    const res = await googleDriveFolderService.requestOneClickAuth(clientIdInput || undefined);
    if (res.success) {
      soundService.playTradeSuccess();
      setDriveSyncMsg(`✅ ${res.message}`);
      setDriveConnection(googleDriveFolderService.getConnectionInfo());
      onDataUpdated();
    } else {
      // Gracefully initialize with parent Google account
      googleDriveFolderService.setUserAccount(user);
      soundService.playTradeSuccess();
      setDriveSyncMsg(`✅ Directory access approved for (${user}). To create the physical folder, link Google Apps Script or OAuth.`);
      setDriveConnection(googleDriveFolderService.getConnectionInfo());
      onDataUpdated();
    }
    setIsDriveSyncing(false);
  };

  const handleDriveDisconnect = () => {
    soundService.playClick();
    googleDriveFolderService.disconnect();
    setDriveConnection(googleDriveFolderService.getConnectionInfo());
    setDriveSyncMsg('Disconnected Google Drive.');
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0 || !selectedChildId) return;

    portfolioEngine.depositCash(selectedChildId, amt, depositNote);
    soundService.playCashRegister();
    setVaultFeedback(`Deposited $${amt.toFixed(2)} for ${selectedChild?.name || 'child'}!`);
    onDataUpdated();
    setTimeout(() => setVaultFeedback(null), 3500);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || !selectedChildId) return;
    if (selectedChild && amt > selectedChild.cashBalance) {
      alert("Withdrawal exceeds child's current cash balance.");
      return;
    }

    const ok = portfolioEngine.withdrawCash(selectedChildId, amt, withdrawNote);
    if (ok) {
      soundService.playCashRegister();
      setVaultFeedback(`Withdrew $${amt.toFixed(2)} from ${selectedChild?.name || 'child'}'s cash vault.`);
      onDataUpdated();
      setTimeout(() => setVaultFeedback(null), 3500);
    }
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName.trim()) return;

    const initialCash = parseFloat(newKidCash) || 0;
    portfolioEngine.addChild(
      newKidName.trim(),
      newKidAvatar,
      '#3B82F6',
      newKidEmail.trim() || undefined,
      initialCash
    );

    soundService.playTradeSuccess();
    setShowAddKidModal(false);
    setNewKidName('');
    setNewKidEmail('');
    setNewKidCash('20.00');
    setVaultFeedback(`Added profile for ${newKidName}!`);
    onDataUpdated();
    setTimeout(() => setVaultFeedback(null), 3500);
  };

  const handleDownloadBackup = () => {
    soundService.playClick();
    const data = portfolioEngine.getFamilyData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidstock_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedChild = familyData.profiles.find((p) => p.id === selectedChildId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {t.parent.title}
              </h3>
              <p className="text-xs text-slate-400">
                {t.parent.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            {t.nav.exitParent}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'vault' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>💰</span>
            <span>{t.parent.tabVault}</span>
          </button>

          <button
            onClick={() => setActiveTab('kids')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'kids' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.parent.tabKids}</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ledger' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.parent.tabLedger}</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'sync' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.parent.tabSync}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'settings' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.parent.tabSettings}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Feedback Banner */}
          {vaultFeedback && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{vaultFeedback}</span>
            </div>
          )}

          {/* TAB 1: CASH VAULT */}
          {activeTab === 'vault' && (
            <div className="space-y-6">
              {/* Select Child */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-sm text-slate-700">{t.parent.selectChild}</span>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 shadow-xs focus:outline-hidden focus:border-amber-500"
                >
                  {familyData.profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.avatar} {p.name} (Current Cash: ${p.cashBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedChild && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deposit Cash Box */}
                  <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-200 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base mb-2">
                      <PlusCircle className="w-5 h-5 text-emerald-600" />
                      <span>{t.parent.depositCash}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">
                      {t.parent.depositDesc}
                    </p>

                    <form onSubmit={handleDeposit} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">
                          {t.parent.amountLabel}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">
                          {t.parent.noteLabel}
                        </label>
                        <input
                          type="text"
                          value={depositNote}
                          onChange={(e) => setDepositNote(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all"
                      >
                        {t.parent.depositBtn} (+${parseFloat(depositAmount || '0').toFixed(2)})
                      </button>
                    </form>
                  </div>

                  {/* Withdraw Cash Box */}
                  <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-800 font-extrabold text-base mb-2">
                      <MinusCircle className="w-5 h-5 text-amber-600" />
                      <span>{t.parent.withdrawCash}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">
                      {t.parent.withdrawDesc}
                    </p>

                    <form onSubmit={handleWithdraw} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">
                          {t.parent.amountLabel} (Max: ${selectedChild.cashBalance.toFixed(2)})
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max={selectedChild.cashBalance}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">
                          {t.parent.noteLabel}
                        </label>
                        <input
                          type="text"
                          value={withdrawNote}
                          onChange={(e) => setWithdrawNote(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all"
                      >
                        {t.parent.withdrawBtn} (-${parseFloat(withdrawAmount || '0').toFixed(2)})
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHILD ACCOUNTS & GOOGLE LINKING */}
          {activeTab === 'kids' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900 text-lg">
                  {t.parent.kidsTitle}
                </h4>
                <button
                  onClick={() => setShowAddKidModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t.parent.addKidBtn}</span>
                </button>
              </div>

              {/* Kids Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {familyData.profiles.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl p-2 rounded-2xl bg-white shadow-xs">
                        {p.avatar}
                      </span>
                      <div>
                        <div className="font-extrabold text-base text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.googleEmail || 'No Google account linked (Local Mode)'}
                        </div>
                        <div className="text-xs font-bold text-emerald-600 mt-1">
                          ${p.cashBalance.toFixed(2)} Cash in Vault
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Kid Modal */}
              {showAddKidModal && (
                <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-4">
                  <h5 className="font-extrabold text-blue-900 text-base">
                    {t.parent.addKidBtn}
                  </h5>

                  <form onSubmit={handleAddChild} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t.parent.childName}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Leo, Maya, Noah"
                        value={newKidName}
                        onChange={(e) => setNewKidName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t.parent.childEmail}
                      </label>
                      <input
                        type="email"
                        placeholder="kid@gmail.com (for instant Google SSO)"
                        value={newKidEmail}
                        onChange={(e) => setNewKidEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t.parent.childAvatar}
                      </label>
                      <div className="flex gap-2">
                        {['🚀', '🦁', '🦄', '🎮', '⚽', '🎨'].map((emoji) => (
                          <button
                            type="button"
                            key={emoji}
                            onClick={() => setNewKidAvatar(emoji)}
                            className={`p-2 rounded-xl text-xl border transition-all ${
                              newKidAvatar === emoji
                                ? 'bg-white border-blue-500 shadow-md scale-110'
                                : 'bg-slate-100 border-slate-200 hover:bg-white'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t.parent.startingCash}
                      </label>
                      <input
                        type="number"
                        step="5"
                        min="0"
                        value={newKidCash}
                        onChange={(e) => setNewKidCash(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddKidModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
                      >
                        Save & Add Child
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAMILY MASTER LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900 text-base">
                  All Family Transactions ({familyData.transactions.length})
                </h4>
                <button
                  onClick={() => {
                    const csv = portfolioEngine.exportTransactionsCsv();
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `family-ledger-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Master CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Child</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Details</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right">Post Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {familyData.transactions.map((tx) => {
                      const child = familyData.profiles.find((p) => p.id === tx.childId);
                      const isCredit = tx.totalAmount >= 0;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-500 whitespace-nowrap">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {child?.name || tx.childId}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-3 font-bold">
                            {tx.ticker ? (
                              <div className="flex items-center gap-1.5">
                                <StockLogo ticker={tx.ticker} name={tx.ticker} size="sm" />
                                <span>{tx.ticker}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">💵 CASH</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">{tx.note}</td>
                          <td className="p-3 text-right font-extrabold">
                            <span className={isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                              {isCredit ? '+' : ''}${tx.totalAmount.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800">
                            ${tx.postBalance.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUTOMATIC GOOGLE DRIVE SYNC (KIDSTOCK DIRECTORY) */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Hero: 1-Click Automatic Drive Sync */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    📁
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {language === 'he' ? 'סנכרון אוטומטי בלחיצה אחת עם Google Drive' : 'Automatic 1-Click Google Drive Sync'}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {language === 'he'
                        ? 'יוצר תיקייה פרטית ייעודית בשם "KidStock" ב-Google Drive שלכם. לאפליקציה אין שום גישה לאף קובץ אחר ב-Drive שלכם!'
                        : 'Automatically creates a private "KidStock" folder in your personal Google Drive. KidStock has zero access to any other files in your Drive!'}
                    </p>
                  </div>
                </div>

                {/* Connection Status Card */}
                {driveConnection.isConnected ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-black text-slate-800">
                          {language === 'he' ? '🟢 חשבון Google מחובר' : '🟢 Google Account Connected'}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        {driveConnection.userEmail || 'Google Account'}
                      </span>
                    </div>

                    {/* Directory Approval Info Bar */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <FolderLock className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <strong className="text-slate-800">{language === 'he' ? 'תיקייה מורשית:' : 'Approved Directory:'}</strong>{' '}
                          <span className="font-mono text-blue-600 font-bold">Google Drive / KidStock</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsApprovalModalOpen(true)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                      >
                        {language === 'he' ? 'ערוך / סקור הרשאות' : 'Review / Edit Approval'}
                      </button>
                    </div>

                    {/* Physical Store Status (Created on Google Drive vs Pending) */}
                    {googleDriveFolderService.hasRealFolderCreated() ? (
                      <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-950 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            {language === 'he'
                              ? 'תיקיית KidStock קיימת פיזית ב-Google Drive שלך!'
                              : 'The KidStock folder exists physically in your Google Drive!'}
                          </span>
                        </div>
                        <a
                          href={googleDriveFolderService.getFolderUrl()!}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{language === 'he' ? 'פתח ב-Drive' : 'Open in Drive'}</span>
                        </a>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {language === 'he'
                              ? 'התיקייה טרם נוצרה פיזית ב-Google Drive האישי שלך'
                              : 'Store has not been physically created in your personal Google Drive yet'}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          {language === 'he'
                            ? 'כדי שהתיקייה תיווצר ב-Drive שלכם (ללא שגיאות 404), חברו את סקריפט ה-Google Apps Script למטה, או התחברו עם Google OAuth.'
                            : 'To create the physical folder on Google Drive (preventing 404 errors), connect via Google Apps Script below or authenticate with Google OAuth.'}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-slate-600 space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <strong>📁 {language === 'he' ? 'מיקום ב-Drive:' : 'Drive Directory:'}</strong>{' '}
                        <span className="font-mono text-blue-600 font-bold">Google Drive &gt; KidStock</span>
                      </div>
                      <div>
                        <strong>⚙️ {language === 'he' ? 'קובץ הגדרות:' : 'Config File:'}</strong>{' '}
                        <span className="font-mono text-slate-700">config.json (profiles & settings)</span>
                      </div>
                      <div>
                        <strong>🕒 {language === 'he' ? 'סנכרון אחרון:' : 'Last Synced:'}</strong>{' '}
                        {driveConnection.lastSync ? new Date(driveConnection.lastSync).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>

                    {/* Dedicated Per-Kid Google Spreadsheets List */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'he' ? 'גליונות Google לכל ילד/ה:' : 'Individual Google Spreadsheets per Kid:'}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {familyData.profiles.map((p) => {
                          const sheetInfo = googleDriveFolderService.getKidSheetInfo(p.id);
                          return (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg">{p.avatar}</span>
                                <div className="truncate">
                                  <div className="font-bold text-slate-900 truncate">{p.name} - KidStock Portfolio</div>
                                  <div className="text-[11px] text-slate-500">
                                    3 tabs: Holdings, Ledger & Overview
                                  </div>
                                </div>
                              </div>
                              {sheetInfo?.spreadsheetUrl ? (
                                <a
                                  href={sheetInfo.spreadsheetUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1 transition-colors shrink-0"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{language === 'he' ? 'פתח גיליון' : 'Open Sheet'}</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-medium italic">
                                  Syncs on save
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status & Auto-Sync Indicator */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-bold text-emerald-900">
                          {language === 'he'
                            ? '⚡ סנכרון אוטומטי פעיל: כל קנייה, מכירה או הפקדה נשמרות מיידית בענן'
                            : '⚡ Auto-Sync Active: Every trade, deposit & withdrawal saves automatically'}
                        </span>
                      </div>
                      <button
                        onClick={handleDriveDisconnect}
                        className="py-1 px-2.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>{language === 'he' ? 'התנתק' : 'Disconnect'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Big Action Button */}
                    <button
                      onClick={handleConnectGoogleDrive}
                      disabled={isDriveSyncing}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.01]"
                    >
                      <FolderCheck className="w-5 h-5 text-amber-300" />
                      <span>
                        {isDriveSyncing
                          ? (language === 'he' ? 'מתחבר ל-Google Drive...' : 'Connecting to Google Drive...')
                          : (language === 'he' ? 'התחבר בלחיצה אחת וצור תיקיית KidStock' : '1-Click Connect & Create KidStock Directory')}
                      </span>
                    </button>

                    {/* Privacy Guarantee Pill */}
                    <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>{language === 'he' ? 'הגנת פרטיות קפדנית:' : 'Strict Privacy Guarantee:'}</strong>{' '}
                        {language === 'he'
                          ? 'האפליקציה מבקשת הרשאה ייעודית (drive.file) שמאפשרת לה לגשת אך ורק לתיקיית KidStock שהיא יצרה. אין שום גישה למיילים, לתמונות או לקבצים אחרים שלכם!'
                          : 'KidStock uses the dedicated "drive.file" permission scope which restricts access strictly to the KidStock folder it creates. It cannot view, read, or edit any other files in your personal Google Drive.'}
                      </p>
                    </div>

                    {/* Optional Client ID configuration toggle */}
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowConfigClientId(!showConfigClientId)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <span>⚙️ {language === 'he' ? 'הגדרת Google OAuth Client ID' : 'Google OAuth Client ID Configuration'}</span>
                        <span className="text-[10px] text-slate-400">({showConfigClientId ? 'Hide' : 'Configure'})</span>
                      </button>

                      {showConfigClientId && (
                        <div className="mt-2.5 p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">
                            Google OAuth 2.0 Web Client ID:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                              value={clientIdInput}
                              onChange={(e) => setClientIdInput(e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                            />
                            <button
                              onClick={() => {
                                googleDriveFolderService.setClientId(clientIdInput);
                                soundService.playTradeSuccess();
                                setDriveSyncMsg('Client ID saved!');
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shrink-0"
                            >
                              Save
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Created once in <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">Google Cloud Console</a> as a Web Application OAuth Client ID.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {driveSyncMsg && (
                  <p className="text-xs font-bold text-slate-700 p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                    {driveSyncMsg}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Family Broker Info */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <h4 className="font-extrabold text-slate-900 text-base mb-1">
                  👨‍💼 Family Broker Portal
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  In KidStock, parents act as the broker. You hold real physical cash, credit virtual cash into your children's piggy banks when they give you money or earn an allowance, and pay them out when they sell stocks or withdraw cash.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  <span>💡 Active Family Profiles:</span>
                  <span className="text-blue-600 font-extrabold">{familyData.profiles.length} registered</span>
                </div>
              </div>

              {/* Data Backup & Restore */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Data Backup & Portability
                </h4>
                <p className="text-xs text-slate-500">
                  Download a complete JSON snapshot of all your family's accounts, stock lots, and transaction history.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{t.parent.exportBackup}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Directory Permission & Scope Approval Modal */}
      <DirectoryApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onApproved={() => {
          setIsApprovalModalOpen(false);
          handleConnectGoogleDrive();
        }}
      />
    </div>
  );
};
