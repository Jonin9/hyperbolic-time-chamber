import './globals.css';

export const metadata = {
  title: 'Hyperbolic Time Chamber',
  description: 'Japan bulk tracker'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
