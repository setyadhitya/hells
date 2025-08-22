import './globals.css';

export const metadata = {
  title: 'Stern',
  description: 'Sistem Praktikum',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
