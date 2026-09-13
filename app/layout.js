import './globals.css';
import './details.css';

export const metadata = {
  title: 'Hyperbolic Time Chamber',
  description: 'Japan bulk tracker',
  manifest: '/manifest.webmanifest',
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
      <body>{children}</body>
    </html>
  );
}
