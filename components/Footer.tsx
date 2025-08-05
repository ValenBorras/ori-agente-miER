import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-600/90 backdrop-blur-sm text-white py-3 md:py-4 shadow-lg border-t border-gray-200/50 fixed bottom-0 left-0 right-0 z-20">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-1 md:mb-2">
          <Image
            alt="ER Modernización"
            className="mx-auto"
            height={40}
            src="/FooterER_Modernizacion.svg"
            width={150}
          />
        </div>
        <p className="text-xs md:text-sm my-2 md:my-3">
          © Gobierno de Entre Ríos 2025 | AI Dept. Pathfinding S.A. -
          valentina.borras@pathfinding.com.ar
        </p>
      </div>
    </footer>
  );
}
