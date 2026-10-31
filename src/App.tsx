import React, { useState, useEffect } from 'react';
import { portfolioEngine } from './services/portfolioEngine';
import { marketService } from './services/marketService';
import { googleDriveFolderService } from './services/googleDriveFolderService';
import { authService, AuthUser } from './services/authService';
import { FamilyData, ChildProfile, AggregatedHolding, AccountStatus } from './types';

import { Header } from './components/Header';
import { KidDashboard } from './components/KidDashboard';
import { StockDetailModal } from './components/StockDetailModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { ParentPortal } from './components/ParentPortal';
import { GoogleSignInGate } from './components/GoogleSignInGate';
import { KidExplainerModal } from './components/KidExplainerModal';
import { KidLiveTour } from './components/KidLiveTour';
import { PostTradeCelebrationModal, TradeLessonInfo } from './components/PostTradeCelebrationModal';

export const App: React.FC = () => {
  // Auth state: Google user or guest
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  // Core Family Data State (Auto-persists in LocalStorage and syncs with Google Sheet)
  const [familyData, setFamilyData] = useState<FamilyData>(portfolioEngine.getFamilyData());
  const [currentChildId, setCurrentChildId] = useState<string>(familyData.profiles[0]?.id || '');

  // Modals
  const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isLiveTourActive, setIsLiveTourActive] = useState<boolean>(false);
  const [completedTrade, setCompletedTrade] = useState<TradeLessonInfo | null>(null);

  // Tutorial tracking: once clicked or dismissed, remove the tutorial option from UI
  const [hasClickedTutorial, setHasClickedTutorial] = useState<boolean>(() => {
    return localStorage.getItem('kidstock_tutorial_clicked') === 'true';
  });

  const handleOpenTutorial = () => {
    localStorage.setItem('kidstock_tutorial_clicked', 'true');
    setHasClickedTutorial(true);
    setIsHowItWorksOpen(true);
  };

  const handleStartTour = () => {
    localStorage.setItem('kidstock_tutorial_clicked', 'true');
    setHasClickedTutorial(true);
    setIsLiveTourActive(true);
  };

  const handleDismissTour = () => {
    localStorage.setItem('kidstock_tutorial_clicked', 'true');
    setHasClickedTutorial(true);
  };

  // Subscribe to live portfolio, auth changes, and market tick updates
  useEffect(() => {
    // Check for fresh remote data from Google Drive / Sheets on load
    if (googleDriveFolderService.isConnected()) {
      googleDriveFolderService.pullFromDrive().then((res) => {
        if (res.success) {
          setFamilyData(portfolioEngine.getFamilyData());
        }
      });
    }

    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
      setIsAuthenticated(authService.isAuthenticated());
      setFamilyData(portfolioEngine.getFamilyData());
    });

    const unsubPortfolio = portfolioEngine.subscribe((newData) => {
      setFamilyData(newData);
      // Auto-sync with Google Drive KidStock directory in background
      if (googleDriveFolderService.isConnected()) {
        googleDriveFolderService.pushToDrive();
      }
    });

    const unsubMarket = marketService.subscribe(() => {
      // Re-trigger subtle UI state update on market ticks
      setFamilyData((prev) => ({ ...prev }));
    });

    return () => {
      unsubAuth();
      unsubPortfolio();
      unsubMarket();
    };
  }, []);

  const currentChild: ChildProfile | null =
    familyData.profiles.find((p) => p.id === currentChildId) || familyData.profiles[0] || null;

  const holdings: AggregatedHolding[] = currentChild
    ? portfolioEngine.getAggregatedHoldings(currentChild.id)
    : [];

  const accountStatus: AccountStatus = currentChild
    ? portfolioEngine.getAccountStatus(currentChild.id)
    : {
        cashBalance: 0,
        investedValue: 0,
        totalNetWorth: 0,
        todayGainLoss: 0,
        todayReturnPercent: 0,
        lifetimeNetGainLoss: 0,
        lifetimeReturnPercent: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      };

  // If not authenticated with Google or as guest, show the Google SSO gate on entry
  if (!isAuthenticated) {
    return (
      <GoogleSignInGate
        currentUser={currentUser}
        onSignedIn={() => {
          setIsAuthenticated(true);
          setCurrentUser(authService.getUser());
          setFamilyData(portfolioEngine.getFamilyData());
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header: Profile Switcher, Language (EN/HE), Sound FX, Google Account & Parent Broker Button */}
      <Header
        currentChild={currentChild}
        profiles={familyData.profiles}
        onSelectChild={(id) => setCurrentChildId(id)}
        onOpenParentPortal={() => setIsParentPortalOpen(true)}
        isParentMode={isParentPortalOpen}
        onExitParentMode={() => setIsParentPortalOpen(false)}
        currentUser={currentUser}
        onOpenSignIn={() => setIsSignInModalOpen(true)}
        onSignOut={() => {
          authService.signOut();
          setIsSignInModalOpen(false);
          setIsParentPortalOpen(false);
        }}
        onOpenHowItWorks={handleOpenTutorial}
      />

      {/* ONE UNIFIED PAGE FOR THE KID */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentChild && (
          <KidDashboard
            child={currentChild}
            accountStatus={accountStatus}
            holdings={holdings}
            onSelectStock={(ticker) => setSelectedStockTicker(ticker)}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            showTourBanner={!hasClickedTutorial}
            onStartTour={handleStartTour}
            onDismissTour={handleDismissTour}
          />
        )}
      </main>

      {/* MODAL 1: Simplified Buy/Sell Modal */}
      {selectedStockTicker && currentChild && (
        <StockDetailModal
          ticker={selectedStockTicker}
          child={currentChild}
          holdings={holdings}
          onClose={() => setSelectedStockTicker(null)}
          onTradeComplete={(trade) => {
            setFamilyData(portfolioEngine.getFamilyData());
            if (trade) {
              setCompletedTrade(trade);
            }
          }}
        />
      )}

      {/* POST-TRADE CELEBRATION & MARKET LESSON MODAL */}
      {completedTrade && (
        <PostTradeCelebrationModal
          trade={completedTrade}
          onClose={() => setCompletedTrade(null)}
        />
      )}

      {/* MODAL 2: Full Transaction History Ledger */}
      {isHistoryModalOpen && (
        <TransactionHistoryModal
          child={currentChild || undefined}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {/* MODAL 3: Parent Portal (Direct Access) */}
      {isParentPortalOpen && (
        <ParentPortal
          familyData={familyData}
          onClose={() => setIsParentPortalOpen(false)}
          onDataUpdated={() => {
            setFamilyData(portfolioEngine.getFamilyData());
          }}
        />
      )}

      {/* MODAL 4: Google SSO Account Switcher / Connection Modal */}
      {isSignInModalOpen && (
        <GoogleSignInGate
          currentUser={currentUser}
          onSignedIn={() => {
            setIsAuthenticated(true);
            setCurrentUser(authService.getUser());
            setIsSignInModalOpen(false);
            setFamilyData(portfolioEngine.getFamilyData());
          }}
          onClose={() => setIsSignInModalOpen(false)}
        />
      )}

      {/* MODAL 5: Kid Explanation Hub (Tour / Stories / Video) */}
      {isHowItWorksOpen && (
        <KidExplainerModal
          onClose={() => setIsHowItWorksOpen(false)}
          onStartLiveTour={() => {
            setIsHowItWorksOpen(false);
            setIsLiveTourActive(true);
          }}
        />
      )}

      {/* OVERLAY: In-Page Live Spotlight Tour */}
      {isLiveTourActive && (
        <KidLiveTour
          onClose={() => {
            setIsLiveTourActive(false);
            setHasClickedTutorial(true);
          }}
          onComplete={() => {
            setHasClickedTutorial(true);
            localStorage.setItem('kidstock_tutorial_clicked', 'true');
            if (currentChild) {
              localStorage.setItem(`kidstock_tour_done_${currentChild.id}`, 'true');
            }
          }}
        />
      )}
    </div>
  );
};
