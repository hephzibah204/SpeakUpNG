import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "evote.ng - Rate Nigerian Government Officials",
  description:
    "evote.ng helps citizens rate Nigerian government officials, compare rankings, vote in civic polls, and track public accountability with anonymous reviews.",
  keywords:
    "Nigeria politics, government ratings, public officials Nigeria, civic accountability, evote.ng, citizen polls Nigeria",
  openGraph: {
    title: "evote.ng - Civic Ratings and Accountability in Nigeria",
    description:
      "Rate officials, view rankings, and join anonymous civic polls that strengthen public accountability in Nigeria.",
    type: "website",
    locale: "en_NG",
    siteName: "evote.ng",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
