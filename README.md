# 🚀 KidStock

**The fun, educational stock market paper-trading platform where parents are the broker and kids learn real investing.**

---

## 💡 How It Works

```
[ Real World ]
  🧒 Kid hands $20 allowance / chore money to Parent ──► 👨 Parent holds real cash safely
                                                                 │
[ KidStock App ]                                                ▼
  🧒 Kid selects profile (iPad / phone) ◄────── 👨 Parent adds $20 into Kid's Vault
        │
        ▼
  🛒 Kid buys $5.00 of Roblox & $10.00 of Apple (Fractional shares)
        │
        ▼
  📈 Tracks live market value, batch buy profits, and syncs to Family Google Sheet!
```

1. **No Real Money at Risk**: The parent acts as the "broker" and bank. When a kid earns cash in real life, they give it to the parent, who credits their virtual Piggy Bank.
2. **Instant Fractional Trading**: Kids can invest small allowance amounts (\$5 or \$10) to own slices of their favorite companies.
3. **Dual-Level Position Tracking**:
   - **Per-Batch Buy Lots**: Every single purchase is logged with exact date, buy price, shares, cost basis, and individual batch profit/loss.
   - **Aggregated Stock View**: Roll-up view per stock showing total shares, average cost basis, total value, and overall profit/loss.
4. **Complete Transaction History**: Full immutable audit trail of every deposit, withdrawal, buy, and sell with running cash balances and CSV/JSON export.
5. **Curated 60 Kid-Favorite Stocks & ETFs**: Roblox, Apple, Disney, Nike, McDonald's, Tesla, Oreo, Duolingo, S&P 500, and more across 7 engaging categories.
6. **Kid-Friendly Metrics**:
   - 🐘 **Monster Size (Market Cap)**: Visual scale from Puppy to Mega Titan.
   - 🏷️ **Value Tag (P/E Ratio)**: Bargain vs. High-Growth meter.
   - 🎁 **Pocket Money Bonus (Dividend)**: Annual bonus cash paid to shareholders.
   - 🎢 **Rollercoaster Score (Volatility)**: 🐢 Turtle, 🐬 Dolphin, or 🐆 Cheetah.
7. **1-Click Automated Google Drive Sync (Strictly Private `KidStock` Directory)**:
   - **Zero access to other files**: Uses Google's dedicated `drive.file` permission scope, granting access **strictly and solely to the `KidStock` directory** created by the app. It cannot view, read, or touch any other files in your personal Google Drive!
   - **One-click automatic directory creation**: When you press **Connect**, KidStock automatically initializes a private `KidStock` directory with your `KidStock - Family Portfolio.json` inside it.
   - **Automated background sync**: Balances, buy lots, and transactions automatically sync across phones, iPads, and computers.
   - **Alternative Web App method supported**: Also supports connecting via Google Apps Script Web App URL if desired.
8. **Multi-Language (i18n)**: English (EN) and Hebrew (HE) with full Right-to-Left (RTL) support.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Animation & Audio**: Canvas Confetti & Web Audio API sound synthesizers
- **Cloud Backend**: Google Drive Automated Directory Sync (`drive.file` isolated scope) + Google Sheets Apps Script Web App + LocalStorage offline fallback
- **Market Data**: Open market quotes + built-in fallback dataset with simulated live ticker
- **Hosting**: GitHub Pages (Static Single Page Application)

---

## 🚀 Quick Start

### 1. Run Locally
```bash
git clone https://github.com/<your-username>/kidstock.git
cd kidstock
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Deploy to GitHub Pages (100% Free)
```bash
npm run build
```
Push to GitHub and enable **GitHub Pages** under repository **Settings > Pages > Deploy from branch (`gh-pages` or GitHub Actions)**.

---

## 📁 1-Click Automatic Google Drive Sync (`KidStock` Directory Only)

1. Open **Parent Portal > Cloud Sync**.
2. Click **"1-Click Connect & Create KidStock Directory"**.
3. Sign in with your Google account:
   - Google displays the official consent dialog: *"See, create, and edit only the Google Drive files that you use with this app."*
   - KidStock automatically creates the `KidStock` folder and your `KidStock - Family Portfolio.json`.
4. All family devices automatically stay in sync! Click **"Open in Drive"** at any time to inspect your private `KidStock` directory in Google Drive.

---

## 📂 Project Structure

```
kidstock/
├── public/                 # Static assets & favicon
├── src/
│   ├── components/         # Kid & Parent UI components
│   │   ├── Header.tsx                  # Profile switcher, stats, language & parent toggle
│   │   ├── KidDashboard.tsx            # Unified 1-page kid experience (Balance, Holdings, Stocks)
│   │   ├── StockDetailModal.tsx        # Ultra-simple dollar buy & sell modal
│   │   ├── ExplainerTooltip.tsx        # "ℹ️" Kid explanations & real-world examples
│   │   ├── TransactionHistoryModal.tsx # Full immutable ledger & export
│   │   └── ParentPortal.tsx            # Cash vault, kid accounts, Google Sheets URL & settings
│   ├── data/
│   │   └── curatedStocks.ts            # 60 kid stocks with simple kid-friendly descriptions
│   ├── i18n/                           # Bilingual translations (EN & HE with RTL)
│   ├── services/
│   │   ├── googleSheetBackend.ts       # Direct HTTPS sync to Google Sheets Web App
│   │   ├── marketService.ts            # Live quotes, history & tick simulation
│   │   ├── soundService.ts             # Web Audio trade & cash chimes
│   │   └── portfolioEngine.ts          # Lots, FIFO sales, balances & ledger logic
│   ├── types/
│   │   └── index.ts                    # TypeScript types (Lots, Holdings, Transactions)
│   ├── App.tsx                         # Main application state & routing
│   └── main.tsx                        # React DOM root
├── google-apps-script/
│   └── Code.gs                         # Turnkey Google Sheets Web App backend script
├── vite.config.ts          # Vite configuration with GitHub Pages base path
└── package.json
```

---

## 📄 License
MIT License. Free and open source for families everywhere!
