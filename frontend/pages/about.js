import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar active="/about" />

      <main className="max-w-3xl mx-auto px-8 py-24">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">About</p>
        <h1 className="text-4xl font-semibold tracking-tight leading-tight">
          Built for researchers who want to understand, not just skim.
        </h1>

        <p className="mt-8 text-zinc-400 leading-relaxed">
          ClearModel started from a real frustration. Reading a dense research paper and having no mental model of what the authors actually did, or why the results matter, is a problem that affects every student and engineer who reads outside their exact specialty.
        </p>

        <p className="mt-4 text-zinc-400 leading-relaxed">
          Most tools produce a paragraph summary. ClearModel produces a structured workspace. It first identifies what kind of paper you are reading, whether a method proposal, a comparison study, or a dataset paper, and then tailors the entire analysis to that type. A comparison paper has each strategy explained individually. A method paper traces the pipeline from input to output. The analysis changes based on the paper, not the other way around.
        </p>

        <p className="mt-4 text-zinc-400 leading-relaxed">
          The question answering works differently from a generic chatbot. The paper is split into chunks, each chunk is converted into a vector embedding and stored in a local vector database. When you ask a question, the system finds the most relevant chunks using cosine similarity and answers from those specific passages. The answers reference what the paper actually says rather than what a language model thinks is generally true about the topic.
        </p>

        <div className="mt-16 pt-10 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">How it works</p>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Upload a PDF",
                desc: "The text is extracted from the PDF and split into overlapping chunks of around 400 words each."
              },
              {
                step: "02",
                title: "Paper type is detected",
                desc: "The system identifies whether this is a method proposal, comparison study, dataset paper, or survey and adapts every section of the analysis accordingly."
              },
              {
                step: "03",
                title: "Structured analysis is generated",
                desc: "Core problem, key idea, full method breakdown, numerical summary, assumptions, limitations, mental model analogy, and key terms are all produced in a single pass over the paper text."
              },
              {
                step: "04",
                title: "Question answering",
                desc: "Each chunk is embedded using sentence-transformers and stored in ChromaDB. Questions are expanded into specific search terms, matched against stored embeddings, and answered using the retrieved passages."
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6">
                <span className="text-zinc-600 text-sm mt-0.5 shrink-0">{step}</span>
                <div>
                  <h3 className="text-white font-medium">{title}</h3>
                  <p className="mt-1 text-zinc-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Stack</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Frontend", value: "Next.js, React, Tailwind CSS" },
              { label: "Backend", value: "FastAPI, Python" },
              { label: "LLM", value: "Llama 3.3 70B via Groq" },
              { label: "Embeddings", value: "all-MiniLM-L6-v2" },
              { label: "Vector store", value: "ChromaDB" },
              { label: "Diagrams", value: "Mermaid.js" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <a href="/analyze" className="inline-block rounded-xl bg-white text-black px-6 py-3 text-sm font-medium hover:bg-zinc-200 transition">
            Try it now
          </a>
        </div>
      </main>
    </div>
  );
}