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
      <body className="h-screen text-slate-700 overflow-hidden">
        {/* Fixed background image */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed z-0"
          style={{
            backgroundImage: "url(/gobER-expandida.webp)",
          }}
        />
        
        {/* Content container with navbar, scrollable main, and footer */}
        <div className="relative z-10 h-full flex flex-col max-w-7xl mx-auto">
          <NavBar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
