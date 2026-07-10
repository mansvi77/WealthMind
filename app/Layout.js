import './globals.css';

export const metadata = {
  title: 'WealthMind - Workspace Portal',
  description: 'Deterministic local analytics ledger engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-950">
      <body className="antialiased h-full text-slate-100 selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}