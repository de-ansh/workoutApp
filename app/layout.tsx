import "./globals.css";

export const metadata = { title: "Daily Grind", description: "Cardio + Abs Tracker" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, maximum-scale=1" />
        <meta name="theme-color" content="#7B61FF" />
        <meta name="description" content="Daily Grind - Your personal cardio & abs workout companion. Track sessions, monitor progress, and stay hydrated." />
        <meta name="keywords" content="workout, fitness, cardio, abs, exercise, tracker, health" />
        <meta name="author" content="Ansh" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Daily Grind" />
        <meta name="msapplication-TileColor" content="#7B61FF" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="application-name" content="Daily Grind" />
        
        {/* Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body style={{ userSelect: 'none', WebkitUserSelect: 'none' as any }}>
        {children}
        
        {/* PWA Installation Script */}
        <script src="/pwa-install.js" async></script>
      </body>
    </html>
  );
}
