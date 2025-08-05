import "@/styles/globals.css";
import { Metadata } from "next";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Demo JUJO Interactivo - Mi Entre Rios",
    template: `%s - Demo JUJO Interactivo - Mi Entre Rios`,
  },
  icons: {
    icon: "/MiER-Cuadrado.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans`}
      lang="en"
    >
      <head />
      <body className="h-screen bg-image-background text-slate-700 overflow-hidden">
        <div className="h-full flex flex-col">
          <NavBar />
          <main className="flex-1 flex items-center justify-center overflow-hidden">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
