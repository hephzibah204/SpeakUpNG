import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL('https://evote.ng'),
  title: {
    default: "evote.ng - Rate Nigerian Government Officials",
    template: "%s | evote.ng"
  },
  description:
    "evote.ng helps citizens rate Nigerian government officials, compare rankings, vote in civic polls, and track public accountability with anonymous reviews.",
  keywords: ["nigeria", "government", "officials", "rating", "evote", "politics", "accountability"],
  authors: [{ name: "evote.ng" }],
  openGraph: {
    title: "evote.ng - Rate Nigerian Government Officials",
    description: "evote.ng helps citizens rate Nigerian government officials, compare rankings, vote in civic polls, and track public accountability with anonymous reviews.",
    url: 'https://evote.ng',
    siteName: 'evote.ng',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "evote.ng - Rate Nigerian Government Officials",
    description: "evote.ng helps citizens rate Nigerian government officials, compare rankings, vote in civic polls, and track public accountability with anonymous reviews.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index,follow,max-image-preview:large" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <div id="toast" className="toast" />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
