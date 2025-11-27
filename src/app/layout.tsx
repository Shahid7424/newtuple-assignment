
import "./globals.css";
import React from "react";

export const metadata = {
  title: "Realtime AI Chat",
  description: "Real-time streaming chat demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">{children}</div>
      </body>
    </html>
  );
}
