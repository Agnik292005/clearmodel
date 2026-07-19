import { useEffect, useRef } from "react";

function cleanMermaid(chart) {
  let cleaned = chart
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/<!--.*?-->/gs, "")
    .trim();

  // Strip ALL pipe-based arrow labels completely -- just make them plain arrows
  cleaned = cleaned.replace(/-->\|[^|]*\|>/g, "-->");
  cleaned = cleaned.replace(/-->\|[^|]*\|/g, "-->");

  // Clean everything inside square brackets [ ]
  cleaned = cleaned.replace(/\[([^\]]+)\]/g, (_, inner) => {
    const safe = inner
      .replace(/[<>]/g, " ")
      .replace(/&/g, "and")
      .replace(/[#@!$%^*()|]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return `[${safe}]`;
  });

  cleaned = cleaned.replace(/\s*\n\s*/g, "\n");
  return cleaned;
}

export default function MermaidDiagram({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!chart || !ref.current) return;

    import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        themeVariables: {
          background: "#09090b",
          primaryColor: "#27272a",
          primaryTextColor: "#e4e4e7",
          primaryBorderColor: "#3f3f46",
          lineColor: "#71717a",
          secondaryColor: "#18181b",
          tertiaryColor: "#18181b",
        },
      });

      const cleaned = cleanMermaid(chart);
      const id = "mermaid-" + Math.random().toString(36).substr(2, 9);
      ref.current.innerHTML = "";

      mermaid.render(id, cleaned)
        .then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        })
        .catch((err) => {
          console.error("Mermaid error:", err);
          console.error("Chart was:", cleaned);
          if (ref.current) {
            ref.current.innerHTML = `
              <div style="padding:12px">
                <p style="color:#71717a;font-size:13px;margin-bottom:8px">Diagram could not be rendered.</p>
                <pre style="color:#52525b;font-size:11px;white-space:pre-wrap;overflow:auto;max-height:200px">${cleaned}</pre>
              </div>`;
          }
        });
    });
  }, [chart]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
}