import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-600 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-2">
          <Image
            alt="ER Modernización"
            className="mx-auto"
            height={60}
            src="/FooterER_Modernizacion.svg"
            width={200}
          />
        </div>
        <p className="text-sm my-4">
          © Gobierno de Entre Ríos 2025 | AI Dept. Pathfinding S.A. -
          valentina.borras@pathfinding.com.ar
        </p>
      </div>
    </footer>
  );
}
