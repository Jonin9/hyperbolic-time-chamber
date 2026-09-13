import './globals.css';
import './details.css';

export const metadata = {
  title: 'Hyperbolic Time Chamber',
  description: 'Japan bulk tracker',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/apple-icon.jpg', type: 'image/jpeg' }]
  },
  appleWebApp: {
    capable: true,
    title: 'Time Chamber',
    statusBarStyle: 'black-translucent'
  }
};

export const viewport = {
  themeColor: '#050816'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Time Chamber" />
      </head>
      <body>{children}</body>
    </html>
  );
}
