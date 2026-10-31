// Application configuration

export const APP_CONFIG = {
  APP_NAME: 'KidStock',
  DEFAULT_CURRENCY: '$',
  // Optional: If you want all devices to connect automatically without typing the URL in the UI,
  // paste your Google Apps Script Web App URL here:
  GOOGLE_SHEET_WEBAPP_URL: import.meta.env.VITE_GOOGLE_SHEET_URL || '',
  GOOGLE_CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '341366908805-eja9fl3je4phcq0c6bcskqpgnio0hsfe.apps.googleusercontent.com',

  // Default demo child accounts if starting fresh
  DEMO_PROFILES: [
    {
      id: 'child_1',
      name: 'Leo',
      avatar: '🚀',
      color: '#3B82F6',
      cashBalance: 45.0,
      totalDeposited: 100.0,
      totalWithdrawn: 0.0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'child_2',
      name: 'Maya',
      avatar: '🦄',
      color: '#EC4899',
      cashBalance: 25.0,
      totalDeposited: 50.0,
      totalWithdrawn: 0.0,
      createdAt: new Date().toISOString(),
    },
  ],
};
