import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-slate-600 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-2">
          <Image
            src="/FooterER_Modernizacion.svg"
            alt="ER Modernización"
            width={200}
            height={60}
            className="mx-auto"
          />
        </div>
        <p className="text-sm">
          © Gobierno de Entre Ríos 2025
        </p>
      </div>
    </footer>
  );
} 