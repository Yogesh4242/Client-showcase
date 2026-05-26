import HeroFramesWheel from './components/HeroSection'; // Adjust import path as needed

export default function Page() {
  return (
    <main className="relative w-full bg-black text-white">
      
      {/* 1. The Scroll-Synced Canvas Hero */}
      <HeroFramesWheel />

      {/* 2. Subsequent Content Sections */}
      {/* The -mt-px prevents a 1px seam caused by sub-pixel rounding between sticky hero and this section */}
      <section className="relative -mt-px min-h-screen w-full bg-zinc-900 flex flex-col items-center justify-center">
        <div className="max-w-4xl px-8 text-center">
          <h2 className="text-white text-4xl md:text-6xl font-bold mb-6">
            Next Section / Development ON-GOING
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            This section becomes visible smoothly scrolling up once you finish the hero sequence above.
          </p>
        </div>
      </section>

      <section className="relative min-h-screen w-full bg-zinc-800 flex flex-col items-center justify-center">
        <div className="max-w-4xl px-8 text-center">
          <h2 className="text-white text-4xl md:text-6xl font-bold mb-6">
            More Content / Development ON-GOING
          </h2>
          <p className="text-zinc-300 text-lg md:text-xl leading-relaxed">
            Add your services, projects, or any other sections here.
          </p>
        </div>
      </section>
      
    </main>
  );
}