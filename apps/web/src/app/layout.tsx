import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import '@/utils/errorLogger'; // Initialize frontend error logging

export const metadata: Metadata = {
  title: "StudyCollab",
  description: "Real-time collaboration for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
