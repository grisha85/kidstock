import React, { useState } from 'react';

// Domain lookup map for all 60 curated stocks
export const STOCK_DOMAINS: Record<string, string> = {
  RBLX: 'roblox.com',
  NTDOY: 'nintendo.com',
  SONY: 'sony.com',
  MSFT: 'microsoft.com',
  EA: 'ea.com',
  TTWO: 'take2games.com',
  HAS: 'hasbro.com',
  MAT: 'mattel.com',
  U: 'unity.com',
  AAPL: 'apple.com',
  GOOGL: 'google.com',
  AMZN: 'amazon.com',
  NVDA: 'nvidia.com',
  AMD: 'amd.com',
  META: 'meta.com',
  NFLX: 'netflix.com',
  SPOT: 'spotify.com',
  DUOL: 'duolingo.com',
  MCD: 'mcdonalds.com',
  KO: 'coca-cola.com',
  PEP: 'pepsico.com',
  SBUX: 'starbucks.com',
  HSY: 'thehersheycompany.com',
  DPZ: 'dominos.com',
  YUM: 'yum.com',
  MDLZ: 'mondelezinternational.com',
  CMG: 'chipotle.com',
  NKE: 'nike.com',
  CROX: 'crocs.com',
  ADDYY: 'adidas.com',
  LULU: 'lululemon.com',
  SKX: 'skechers.com',
  ONON: 'on-running.com',
  DECK: 'deckers.com',
  UAA: 'underarmour.com',
  DKS: 'dickssportinggoods.com',
  DIS: 'disney.com',
  CMCSA: 'universalstudios.com',
  WBD: 'wbd.com',
  PARA: 'paramount.com',
  AMC: 'amctheatres.com',
  BBW: 'buildabear.com',
  SCHL: 'scholastic.com',
  FUN: 'sixflags.com',
  LYV: 'livenationentertainment.com',
  TSLA: 'tesla.com',
  UBER: 'uber.com',
  F: 'ford.com',
  ABNB: 'airbnb.com',
  WMT: 'walmart.com',
  TGT: 'target.com',
  COST: 'costco.com',
  SPY: 'ssga.com',
  QQQ: 'invesco.com',
  VT: 'vanguard.com',
  HERO: 'globalxetfs.com',
  BOTZ: 'globalxetfs.com',
  VIG: 'vanguard.com',
  ICLN: 'ishares.com',
  DIA: 'ssga.com',
};

interface StockLogoProps {
  ticker: string;
  name: string;
  emoji?: string;
  domain?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({
  ticker,
  name,
  emoji = '📈',
  domain,
  size = 'md',
  className = '',
}) => {
  const stockDomain = domain || STOCK_DOMAINS[ticker.toUpperCase()] || `${ticker.toLowerCase()}.com`;
  const [imgError, setImgError] = useState(false);
  const [useBackupSource, setUseBackupSource] = useState(false);

  // Size styling classes
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl text-base p-1',
    md: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-2xl p-1.5',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-3xl p-2',
    xl: 'w-20 h-20 rounded-3xl text-4xl p-2.5',
  }[size];

  // Primary URL: Google 128px high-res favicon (never blocked, high availability)
  // Secondary fallback: Clearbit Logo API
  const primaryUrl = `https://www.google.com/s2/favicons?domain=${stockDomain}&sz=128`;
  const backupUrl = `https://logo.clearbit.com/${stockDomain}`;

  const currentUrl = useBackupSource ? backupUrl : primaryUrl;

  const handleImgError = () => {
    if (!useBackupSource) {
      setUseBackupSource(true);
    } else {
      setImgError(true);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 shadow-xs flex items-center justify-center shrink-0 overflow-hidden select-none ${sizeClasses} ${className}`}
      title={`${name} (${ticker})`}
    >
      {!imgError ? (
        <img
          src={currentUrl}
          alt={`${name} logo`}
          onError={handleImgError}
          loading="lazy"
          className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <span className="flex items-center justify-center">{emoji}</span>
      )}
    </div>
  );
};
