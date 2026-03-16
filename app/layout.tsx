import type { Metadata } from "next";
import { Caveat, Playfair_Display } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Hieroglyph — Write Your Art",
  description:
    "Create a personalized hand-drawn alphabet, compose encrypted messages, and share them with friends.",
  keywords: ["handwriting", "custom font", "encrypted messages", "generative design"],
  openGraph: {
    title: "Hieroglyph — Write Your Art",
    description: "Create a personalized hand-drawn alphabet and share encrypted messages.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${caveat.variable} ${playfair.variable} antialiased`}>
        <div className="dot-grid" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
