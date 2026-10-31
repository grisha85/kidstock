import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChildProfile } from '../types';
import { portfolioEngine } from '../services/portfolioEngine';
import { soundService } from '../services/soundService';
import {
  X,
  History,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { StockLogo } from './StockLogo';

interface TransactionHistoryModalProps {
  child?: ChildProfile;
  onClose: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  child,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'cash' | 'buys' | 'sells'>('all');

  const transactions = portfolioEngine.getTransactions(child?.id, activeFilter);

  const handleDownloadCsv = () => {
    soundService.playClick();
    const csv = portfolioEngine.exportTransactionsCsv(child?.id);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidstock-transactions-${child?.name || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    soundService.playClick();
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidstock-transactions-${child?.name || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {t.history.title}
              </h3>
              <p className="text-xs text-slate-500">
                {child ? `Audit ledger for ${child.name}` : t.history.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter and Export Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {t.history.filterAll}
            </button>
            <button
              onClick={() => setActiveFilter('cash')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'cash'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {t.history.filterCash}
            </button>
            <button
              onClick={() => setActiveFilter('buys')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'buys'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {t.history.filterBuys}
            </button>
            <button
              onClick={() => setActiveFilter('sells')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'sells'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {t.history.filterSells}
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.history.downloadCsv}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.history.downloadJson}</span>
            </button>
          </div>
        </div>

        {/* Transactions Table Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">{t.history.noTransactions}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] pb-2">
                    <th className="py-2.5 px-3">{t.history.date}</th>
                    <th className="py-2.5 px-3">{t.history.type}</th>
                    <th className="py-2.5 px-3">{t.history.asset}</th>
                    <th className="py-2.5 px-3">{t.history.details}</th>
                    <th className="py-2.5 px-3 text-right">{t.history.amount}</th>
                    <th className="py-2.5 px-3 text-right">{t.history.balanceAfter}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {transactions.map((tx) => {
                    const isCredit = tx.totalAmount >= 0;

                    let typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        {tx.type}
                      </span>
                    );

                    if (tx.type === 'DEPOSIT_CASH') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>{t.history.cashDeposit}</span>
                        </span>
                      );
                    } else if (tx.type === 'WITHDRAW_CASH') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>{t.history.cashWithdrawal}</span>
                        </span>
                      );
                    } else if (tx.type === 'BUY_STOCK') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                          <ShoppingCart className="w-3 h-3" />
                          <span>{t.history.stockBuy}</span>
                        </span>
                      );
                    } else if (tx.type === 'SELL_STOCK') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                          <Tag className="w-3 h-3" />
                          <span>{t.history.stockSell}</span>
                        </span>
                      );
                    }

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3">{typeBadge}</td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {tx.ticker ? (
                            <div className="flex items-center gap-2">
                              <StockLogo ticker={tx.ticker} name={tx.ticker} size="sm" />
                              <span>{tx.ticker}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500">💵 CASH</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                          {tx.note}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold whitespace-nowrap">
                          <span className={isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                            {isCredit ? '+' : ''}${tx.totalAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                          ${tx.postBalance.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
