import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sawaali",
  description: "Anonymous Q and A for live events",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-neutral-950 text-neutral-100">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-xl p-4 md:p-6">{children}</div>
      </body>
    </html>
  );
}
