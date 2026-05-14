import type { Metadata } from "next";
import "./globals.css";
import { NavigationProgress } from "@/components/layout/navigation-progress";

export const metadata: Metadata = {
  title: "Ayamku - Farm Management",
  description: "Sistem manajemen peternakan ayam — tracking telur, lifecycle, keuangan, vaksinasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased">
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
