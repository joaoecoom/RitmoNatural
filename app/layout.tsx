import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ritmo Natural",
  description: "Um app leve e guiado para ajudar o corpo a sair do modo sobrevivencia.",
  icons: {
    icon: "/brand/ritmo-natural-logo.png",
    apple: "/brand/ritmo-natural-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-stone-50 text-stone-900"
      >
        {children}
      </body>
    </html>
  );
}
