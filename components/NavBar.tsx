"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="pl-5 md:pl-28 bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50 fixed top-0 left-0 right-0 z-30">
      <div className="flex flex-row justify-between items-center w-full max-w-6xl m-auto p-2 md:p-2 h-fit">
        <div className="flex flex-row items-center gap-2 md:gap-3">
          <Link href="https://www.mientrerios.gob.ar/" target="_blank">
            <img
              alt="Mi Entre Rios"
              className="w-17 h-12 md:w-20 md:h-16"
              src="/MiER-Cuadrado.svg"
            />
          </Link>
          <div className="bg-gradient-to-br from-lime-300 to-lime-600 bg-clip-text">
            <p className="text-md md:text-base lg:text-lg font-semibold text-transparent">
              Demo Ori Interactiva - Cuidar Adolescencia - Mi Entre Rios
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
