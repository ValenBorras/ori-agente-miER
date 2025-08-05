"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-[1200px] m-auto p-2 md:p-3 h-fit">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <Link href="https://www.mientrerios.gob.ar/" target="_blank">
            <img
              alt="Mi Entre Rios"
              className="w-20 h-16 md:w-25 md:h-20"
              src="/MiER-Cuadrado.svg"
            />
          </Link>
          <div className="bg-gradient-to-br from-lime-300 to-lime-600 bg-clip-text">
            <p className="text-sm md:text-lg lg:text-xl font-semibold text-transparent">
              Demo JUJO Interactivo - Mi Entre Rios
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
