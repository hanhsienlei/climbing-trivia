import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rock Climbing Trivia",
  description: "Test your rock climbing and bouldering knowledge for quiz night!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
