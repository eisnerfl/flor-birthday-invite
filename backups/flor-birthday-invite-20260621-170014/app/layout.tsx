import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flor Birthday",
  description: "A premium mini landing page birthday invitation for Flor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://db.onlinewebfonts.com/c/a64ff11d2c24584c767f6257e880dc65?family=Helvetica+Regular"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
