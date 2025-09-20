import './globals.css';

export const metadata = {
  title: 'Stern',
  description: 'Sistem Praktikum',
};

// app/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <div className="p-4">
      {children}
    </div>
  );
}
