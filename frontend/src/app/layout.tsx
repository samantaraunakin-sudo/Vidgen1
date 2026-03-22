import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vidgen — AI Avatar Video Generator",
  description:
    "Generate realistic AI talking-head videos from a single photo and script. Create YouTube Shorts, Reels, and full YouTube videos with accurate lip sync and natural movements.",
  keywords: [
    "AI video generator",
    "avatar video",
    "talking head",
    "lip sync",
    "YouTube Shorts",
    "Instagram Reels",
    "SadTalker",
    "text to video",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
