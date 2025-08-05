"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-20">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl m-auto p-1 md:p-2 h-fit">
        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-center md:text-left">
          <Link href="https://www.mientrerios.gob.ar/" target="_blank">
            <img
              alt="Mi Entre Rios"
              className="w-16 h-12 md:w-20 md:h-16"
              src="/MiER-Cuadrado.svg"
            />
          </Link>
          <div className="bg-gradient-to-br from-lime-300 to-lime-600 bg-clip-text">
            <p className="text-xs md:text-base lg:text-lg font-semibold text-transparent">
              Demo JUJO Interactivo - Mi Entre Rios
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
