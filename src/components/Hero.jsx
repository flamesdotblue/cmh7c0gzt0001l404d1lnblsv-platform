import Spline from '@splinetool/react-spline';

function Hero() {
  return (
    <section className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-neutral-950/20 to-neutral-950" />

      <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Real-time Voice Assistant
          </h1>
          <p className="mt-4 text-white/70 text-lg sm:text-xl">
            Speak naturally and hear responses instantly. Minimal, futuristic, and fully in-browser.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
