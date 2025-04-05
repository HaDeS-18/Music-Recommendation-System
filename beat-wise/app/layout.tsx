import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beat Wise",
  description: "A music recommendation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
