import './globals.css';

export const metadata = {
  title: 'WealthMind - Industrial Wealth Tracker',
  description: 'Deterministic local analytics ledger engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}