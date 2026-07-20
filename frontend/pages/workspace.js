import { useEffect, useState, useRef } from "react";
import MermaidDiagram from "../components/MermaidDiagram";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const sections = [
  { id: "keywords", label: "Key Terms" },
  { id: "core-problem", label: "Core Problem" },
  { id: "key-idea", label: "Key Idea" },
  { id: "method", label: "Method" },
  { id: "numerical-summary", label: "By The Numbers" },
  { id: "assumptions", label: "Assumptions" },
  { id: "limitations", label: "Limitations" },
  { id: "mental-model", label: "Mental Model" },
  { id: "diagram", label: "Diagram" },
];

export default function Workspace() {
  const [result, setResult] = useState(null);
  const [paperName, setPaperName] = useState("");
  const [activeSection, setActiveSection] = useState("keywords");

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    const name = sessionStorage.getItem("paperName");
    if (stored) setResult(JSON.parse(stored));
    if (name) setPaperName(name);
  }, []);

  function scrollTo(id) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">No analysis found.</p>
          <a href="/analyze" className="mt-4 inline-block text-sm text-white underline underline-offset-4">
            Analyze a paper
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar active={null} sticky />

      <div className="border-b border-zinc-800 px-6 sm:px-12 py-5">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Research Paper</p>
        <h1 className="text-xl font-semibold tracking-tight truncate">
          {paperName.replace(".pdf", "")}
        </h1>
        {result.paper_type && (
          <p className="mt-3 text-xs text-zinc-500 border border-zinc-800 rounded-full px-3 py-1 inline-block">
            {result.paper_type}
          </p>
        )}
      </div>

      {/* Mobile section nav - horizontal scroll chips, shown below lg only */}
      <div className="lg:hidden border-b border-zinc-800 py-3 overflow-x-auto no-scrollbar sticky top-[57px] bg-black z-40">
        <div className="flex gap-2 px-6 w-max">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition ${
                activeSection === id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 border border-zinc-800 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        <aside className="hidden lg:block w-64 shrink-0 sticky top-[105px] h-[calc(100vh-105px)] border-r border-zinc-800 py-8 px-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Sections</p>
          <nav className="space-y-1">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeSection === id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <a href="/analyze" className="w-full block text-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition text-sm py-2">
              New paper
            </a>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-6 sm:px-12 py-10 space-y-20">

          <Section id="keywords" title="Key Terms">
            <div className="grid grid-cols-1 gap-4">
              {result.keywords && result.keywords.map((item, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
                  <p className="text-sm font-semibold text-white mb-1">
                    {typeof item === "string" ? item : item.term}
                  </p>
                  {item.definition && (
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.definition}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section id="core-problem" title="Core Problem">
            <p className="text-zinc-300 leading-relaxed">{result.core_problem}</p>
          </Section>

          <Section id="key-idea" title="Key Idea">
            <p className="text-zinc-300 leading-relaxed">{result.key_idea}</p>
          </Section>

          <Section id="method" title="Method">
            <p className="text-zinc-300 leading-relaxed">{result.method}</p>
          </Section>

          <Section id="numerical-summary" title="By The Numbers">
            <div className="grid grid-cols-1 gap-4">
              {result.numerical_summary && Object.entries(result.numerical_summary).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="assumptions" title="Assumptions">
            <div className="space-y-4">
              {result.assumptions && result.assumptions.map((item, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
                  <p className="text-sm font-semibold text-white mb-3">
                    {typeof item === "string" ? item : item.assumption}
                  </p>
                  {item.why && (
                    <>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Why assumed</p>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-3">{item.why}</p>
                    </>
                  )}
                  {item.consequence && (
                    <>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">If this breaks</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.consequence}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section id="limitations" title="Limitations">
            <div className="space-y-4">
              {result.limitations && result.limitations.map((item, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
                  <p className="text-sm font-semibold text-white mb-3">
                    {typeof item === "string" ? item : item.limitation}
                  </p>
                  {item.impact && (
                    <>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Practical impact</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.impact}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section id="mental-model" title="Mental Model">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-zinc-300 leading-relaxed">{result.mental_model}</p>
            </div>
          </Section>

          <Section id="diagram" title="Method Diagram">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 overflow-x-auto">
              {result.diagram
                ? <MermaidDiagram chart={result.diagram} />
                : <p className="text-zinc-500 text-sm">No diagram available.</p>
              }
            </div>
          </Section>

        </main>
      </div>

      <ChatPanel sessionId={result.session_id} />
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-2 h-px w-12 bg-zinc-700" />
      </div>
      {children}
    </section>
  );
}

function ChatPanel({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          session_id: sessionId,
          history: messages.slice(-6),
        }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "What are the main findings?",
    "Which method performed best and why?",
    "What datasets were used?",
    "What are the key limitations?",
  ];

  return (
    <div className="border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
          Ask about this paper
        </p>

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex gap-3 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-lg px-3 py-2 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-500">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask anything about this paper..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="rounded-xl bg-white text-black px-5 py-3 text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}