import { useState } from "react";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Analyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API}/analyze-paper`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Something went wrong.");
      }

      const data = await response.json();
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      sessionStorage.setItem("paperName", selectedFile.name);
      window.location.href = "/workspace";
    } catch (err) {
      setError(err.message);
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar active="/analyze" />

      <main className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Analyze a research paper
        </h2>
        <p className="mt-3 text-zinc-400">
          Upload a paper to break it down into clear ideas and mental models.
        </p>

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

          <button
            disabled={!selectedFile || isAnalyzing}
            onClick={handleAnalyze}
            className="mt-8 w-full rounded-xl bg-white text-black py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 transition"
          >
            {isAnalyzing ? "Analyzing…" : "Analyze paper"}
          </button>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {isAnalyzing && (
          <div className="mt-20 text-center text-zinc-400">
            <p className="text-lg font-medium">Analyzing paper…</p>
            <p className="mt-2 text-sm">Extracting structure and building mental model</p>
          </div>
        )}
      </main>
    </div>
  );
}