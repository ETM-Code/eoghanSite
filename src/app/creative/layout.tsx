// app/creative/layout.tsx
import ClientLayout from './clientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}