import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DriveTuner - Time-Based Spotify Drive Mix PWA",
  description: "Generate personalized, time-based Spotify playlists matching your driving vibe with an interactive audio visualizer.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveTuner",
  },
};

export const viewport: Viewport = {
  themeColor: "#1DB954",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#121212] text-white">
        {children}
      </body>
    </html>
  );
}
