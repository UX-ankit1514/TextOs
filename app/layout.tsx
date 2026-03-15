import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        <div className="dot-grid" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
