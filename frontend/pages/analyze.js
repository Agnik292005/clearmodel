import { useState } from "react";

export default function Analyze() {
  // 1️⃣ STATE: memory for whether analysis is done
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  async function handleAnalyze() {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setHasAnalyzed(false);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/analyze-paper", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setAnalysisResult(data);
      setHasAnalyzed(true);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight">ClearModel</h1>

        <div className="flex items-center gap-14 text-[15px] text-zinc-400">
          <a href="/" className="hover:text-white transition">
            Home
          </a>
          <a href="/analyze" className="text-white">
            Analyze
          </a>
          <a href="/about" className="hover:text-white transition">
            About
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="px-6 py-20 max-w-3xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Analyze a research paper
        </h2>
        <p className="mt-3 text-zinc-400">
          Upload a paper to break it down into clear ideas and mental models.
        </p>

        {/* Upload block */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <label className="block border-2 border-dashed border-zinc-800 rounded-xl p-10 text-center cursor-pointer hover:border-zinc-600 transition">
            <p className="text-zinc-300 font-medium">
              {selectedFile ? selectedFile.name : "Drop a PDF here"}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {selectedFile ? "File ready for analysis" : "or click to browse"}
            </p>

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </label>

          {/* 2️⃣ BUTTON: clicking sets state to true */}
          <button
            disabled={!selectedFile || isAnalyzing}
            onClick={handleAnalyze}
            className="mt-8 w-full rounded-xl bg-white text-black py-3 text-sm font-medium
             disabled:opacity-40 disabled:cursor-not-allowed
             hover:bg-zinc-200 transition"
          >
            Analyze paper
          </button>
        </div>

        {isAnalyzing && (
          <div className="mt-20 text-center text-zinc-400">
            <p className="text-lg font-medium">Analyzing paper…</p>
            <p className="mt-2 text-sm">
              Extracting structure and building mental model
            </p>
          </div>
        )}
        {/* OUTPUT: show only AFTER analysis */}
        {hasAnalyzed && analysisResult && (
          <>
            <div className="my-20 h-px bg-zinc-800" />

            <section className="space-y-14">
              <OutputBlock
                title="Core problem"
                description={analysisResult.core_problem}
              />

              <OutputBlock
                title="Key idea"
                description={analysisResult.key_idea}
              />

              <OutputBlock
                title="Method overview"
                description={analysisResult.method}
              />

              <div>
                <h3 className="text-xl font-medium">Assumptions</h3>
                <ul className="mt-4 space-y-2 text-zinc-400 list-disc list-inside">
                  {analysisResult.assumptions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium">Mental model</h3>
                <div className="mt-4 h-48 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-500">
                  {analysisResult.mental_model}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function OutputBlock({ title, description }) {
  return (
    <div>
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="mt-3 text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
