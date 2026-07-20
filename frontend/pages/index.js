export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight">ClearModel</h1>
        <div className="flex items-center gap-14 text-[15px] text-zinc-400">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/analyze" className="hover:text-white transition">Analyze</a>
          <a href="/about" className="hover:text-white transition">About</a>
        </div>
      </nav>

      {/* Hero */}
      <main className="px-8 pt-20 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-block text-xs text-zinc-500 border border-zinc-800 rounded-full px-3 py-1 mb-8 uppercase tracking-widest">
              Research Intelligence
            </div>
            <h2 className="text-5xl sm:text-6xl font-semibold leading-tight tracking-tight">
              Don't just read papers. Understand them.
            </h2>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
              Upload a research paper and get a structured breakdown of its core problem, method, assumptions, and findings. Then ask specific questions and get answers pulled directly from the paper text.
            </p>
            <div className="mt-12 flex gap-5">
              <a href="/analyze" className="rounded-xl bg-white text-black px-7 py-3.5 text-sm font-medium hover:bg-zinc-200 transition">
                Analyze a paper
              </a>
              <a href="/about" className="rounded-xl border border-zinc-700 text-zinc-300 px-7 py-3.5 text-sm font-medium hover:text-white hover:border-zinc-500 transition">
                How it works
              </a>
            </div>
          </div>

          <div className="hidden lg:flex justify-end pr-8">
            <img
              src="/heroImg.png"
              alt="Research paper analysis"
              className="w-full max-w-lg opacity-90
                [mask-image:radial-gradient(ellipse_60%_60%_at_center,black_45%,transparent_100%)]
                [-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_center,black_45%,transparent_100%)]"
            />
          </div>
        </div>
      </main>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* Features */}
      <section className="px-8 pt-16 pb-8 w-full">
        <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          What it actually does
        </h3>
        <p className="mt-4 text-lg text-zinc-400 max-w-2xl">
          A breakdown of every feature and why it exists.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Paper type detection",
              desc: "The system first figures out what kind of paper this is: method proposal, comparison study, dataset paper, or survey. The entire analysis changes based on this. A comparison paper gets each strategy explained individually. A method paper gets a full pipeline walkthrough."
            },
            {
              label: "Structured sections",
              desc: "Instead of a wall of text, the analysis is split into focused sections: core problem, key idea, method, numerical summary, assumptions, limitations, and mental model. Each section answers a specific question about the paper."
            },
            {
              label: "Method diagram",
              desc: "The paper's methodology is rendered as a flowchart. For comparison papers this shows parallel branches for each strategy. For method papers it traces the pipeline from input to output. Generated from the paper's actual content."
            },
            {
              label: "Glossary of terms",
              desc: "Before the analysis, every technical term from the paper gets a plain English definition. The goal is that someone with no background in the field can read the analysis and follow it without getting blocked by jargon."
            },
            {
              label: "Numbers and metrics",
              desc: "Dataset sizes, performance scores, and comparisons are extracted as exact numbers from the paper. If a number is not reported, the system says so rather than making something up."
            },
            {
              label: "Question answering",
              desc: "After the analysis, you can ask questions about the paper. The system finds the most relevant paragraphs using vector search and answers from those passages. Answers reference what the paper says, not general knowledge."
            },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
              <h4 className="text-sm font-semibold text-white mb-2">{label}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent mt-16" />

      {/* How it works */}
      <section className="px-8 pt-16 pb-24 w-full">
        <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          How it works
        </h3>
        <div className="mt-16 grid gap-12 sm:grid-cols-4">
          {[
            { step: "01", title: "Upload a PDF", desc: "Any research paper. Text-based PDFs only." },
            { step: "02", title: "Analysis runs", desc: "Paper type is detected and a full structured breakdown is generated." },
            { step: "03", title: "Explore the workspace", desc: "Read through sections, check the diagram, review key terms." },
            { step: "04", title: "Ask questions", desc: "Type any question. Answers come from relevant passages in the paper." },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <span className="text-zinc-500 text-sm">{step}</span>
              <h4 className="mt-2 text-lg font-medium">{title}</h4>
              <p className="mt-3 text-zinc-400 leading-relaxed text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-8 py-10 text-sm text-zinc-500">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          <p>© {new Date().getFullYear()} ClearModel</p>
          <div className="flex gap-8">
            <a href="/about" className="hover:text-white transition">About</a>
            <a href="/analyze" className="hover:text-white transition">Analyze</a>
            <a href="https://github.com/Agnik292005/clearmodel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}