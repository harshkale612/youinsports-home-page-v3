import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030b12",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.youinsports.ai"),
  title: {
    default: "YouInSports — Athletes Everywhere",
    template: "%s — YouInSports",
  },
  description:
    "A global stage for athletes to build their identity, improve their game and discover what's next. Explore the world of sport through a living network of athletes, sports, rankings and opportunities.",
  keywords: [
    "athletes",
    "sports platform",
    "athlete profile",
    "sports opportunities",
    "athlete discovery",
    "sports rankings",
  ],
  openGraph: {
    title: "YouInSports — Athletes Everywhere",
    description:
      "One Earth. Millions of athletes. One connected sports ecosystem. Explore the global athlete network.",
    siteName: "YouInSports",
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouInSports — Athletes Everywhere",
    description: "A global stage for athletes. Explore the world of sport.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void font-sans text-fg">{children}</body>
    </html>
  );
}
