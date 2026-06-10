import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-8 h-20 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl text-primary uppercase tracking-wider">Azur Yachts</span>
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          <Link className="text-sm font-semibold hover:text-secondary transition-colors" href="/yachts">Flotte</Link>
          <Link className="text-sm font-semibold hover:text-secondary transition-colors" href="/destinations">Destinations</Link>
          <Link className="text-sm font-semibold hover:text-secondary transition-colors" href="/contact">Contact</Link>
          <Button variant="default" asChild>
            <Link href="/dashboard">Connexion</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-24 lg:py-32 xl:py-48 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 z-0"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
                  L'Océan, Votre Nouveau <br/><span className="text-secondary">Terrain de Jeu.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-white/80 md:text-xl">
                  Découvrez notre flotte exclusive de yachts de luxe disponibles à la location sur la Côte d'Azur et au-delà.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8">
                  Explorer la flotte
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white/20 hover:bg-white/20 hover:text-white">
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
