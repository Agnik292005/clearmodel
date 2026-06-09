export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight">ClearModel</h1>

        <div className="flex items-center gap-14 text-[15px] text-zinc-400">
          <a href="/" className="hover:text-white transition">
            Home
          </a>
          <a href="/analyze" className="hover:text-white transition">
            Analyze
          </a>
          <a href="/about" className="hover:text-white transition">
            About
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative px-8 pt-20 lg:pt-16 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Text */}
          <div>
            <h2 className="text-5xl sm:text-6xl font-semibold leading-tight tracking-tight">
              Understand research papers through clear mental models.
            </h2>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
              Upload a research paper and explore its core idea, method, and
              assumptions through structured explanations and visual diagrams.
            </p>

            {/* Buttons */}
            <div className="mt-12 flex gap-5 justify-start sm:justify-start">
              <a
                href="/analyze"
                className="rounded-xl bg-white text-black px-7 py-3.5 text-sm font-medium
                     hover:bg-zinc-200 transition hover:-translate-y-0.5"
              >
                Analyze a paper
              </a>

              <a
                href="/about"
                className="rounded-xl border border-zinc-700 text-zinc-300 px-7 py-3.5
                     text-sm font-medium hover:text-white hover:border-zinc-500 transition"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Right: Image (desktop only) */}
          <div className="hidden lg:flex justify-center">
            {/* Right: Image (desktop only) */}
            <div className="hidden lg:flex justify-center">
              <img
                src="/heroImg.png"
                alt="Mental model diagram"
                className="mt-10 w-full max-w-md
    opacity-90 contrast-90 saturate-90
    [mask-image:radial-gradient(ellipse_60%_60%_at_center,black_45%,transparent_100%)]
    [-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_center,black_45%,transparent_100%)]"
              />
            </div>
          </div>
        </div>
      </main>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* How it works */}
      <section className="px-8 pt-12 pb-24 max-w-6xl mx-auto">
        <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          From paper to understanding
        </h3>

        <p className="mt-4 text-lg text-zinc-400 max-w-2xl">
          A simple process designed to help you reason about research, not skim
          it.
        </p>

        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          <div>
            <span className="text-zinc-500 text-sm">01</span>
            <h4 className="mt-2 text-lg font-medium">Upload a paper</h4>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Provide a PDF of any research paper you want to understand.
            </p>
          </div>

          <div>
            <span className="text-zinc-500 text-sm">02</span>
            <h4 className="mt-2 text-lg font-medium">Extract structure</h4>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              The system identifies the core problem, assumptions, and approach.
            </p>
          </div>

          <div>
            <span className="text-zinc-500 text-sm">03</span>
            <h4 className="mt-2 text-lg font-medium">Build a mental model</h4>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Visual diagrams and explanations help everything click together.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-8 py-10 text-sm text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <p>© {new Date().getFullYear()} ClearModel</p>

          <div className="flex gap-8">
            <a href="/about" className="hover:text-white transition">
              About
            </a>
            <a href="/analyze" className="hover:text-white transition">
              Analyze
            </a>
            <a
              href="https://github.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
