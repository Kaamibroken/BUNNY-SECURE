import '../styles/globals.css';

export const metadata = {
  title: 'BUNNY',
  description: 'BUNNY Website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
