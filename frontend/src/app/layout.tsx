import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Use system Arabic font stack — avoids build failures when Google Fonts is unreachable
// Cairo will be loaded via globals.css @import with a local fallback chain


export const metadata: Metadata = {
  title: "FemCare | فیم كير",
  description: "المنصة الطبية السحابية المتكاملة لعيادات النسائية والتوليد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
