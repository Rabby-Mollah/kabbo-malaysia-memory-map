import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kabbo's Malaysia Memory Map — Made with love by Rabby",
  description: "A personal 3D interactive travel scrapbook, memory map, and digital keepsake for Kabbo visiting Malaysia. Made with love by Rabby.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Kabbo's Malaysia Memory Map",
    description: "A little piece of Malaysia, saved forever for Kabbo. Made with love by Rabby.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#062c21",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="antialiased bg-[#062c21] select-none text-slate-100 overflow-hidden w-screen h-screen">
        {children}
      </body>
    </html>
  );
}
