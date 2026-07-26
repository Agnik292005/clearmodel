# ClearModel

**Upload a research paper. Get a structured breakdown you can actually trust, plus a chat that answers questions grounded in the paper's real text.**

[Live Demo](https://clearmodel.vercel.app) · [Report a bug](https://github.com/Agnik292005/clearmodel/issues)

---

## What it does

Most LLM paper summarizers will confidently hand you a made-up accuracy number. ClearModel doesn't.

Upload a PDF and ClearModel produces:
- **A qualitative breakdown**: core problem, key idea, method, assumptions, limitations, a plain-English mental model, key terms, and a Mermaid diagram of the paper's pipeline
- **A grounded chat**: ask about specific numbers, results, or comparisons, and get answers retrieved directly from the paper's actual text, not generated from the model's memory

The qualitative summary is intentionally **numbers-free**: every statistic, percentage, and metric is deliberately excluded from the generated JSON. This isn't a limitation, it's the fix for a real bug. LLMs asked to summarize and recall exact figures in one pass will happily invent plausible-sounding numbers. Splitting "explain the paper" from "look up the exact number" into two separate systems, one generative and one retrieval-grounded, eliminates that failure mode entirely.

## How the two systems work

**Qualitative analysis**: a single LLM call (Groq, `llama-3.3-70b-versatile`) generates the structured breakdown from the paper's text, with an explicit instruction banning all numeric figures.

**Grounded chat (RAG)**: the full paper is chunked (400 words, 50-word overlap) and embedded with `sentence-transformers` (`all-MiniLM-L6-v2`, ONNX). A question first gets rewritten via query expansion, turning "what was the accuracy" into specific technical search terms, then the top-k most relevant chunks are retrieved and passed to the model as grounding context. If the answer isn't in the retrieved excerpts, the model says so instead of guessing.

Retrieval backend depends on whether you're signed in:
- **Guest**: ephemeral in-memory ChromaDB, per-session
- **Signed in**: persistent PostgreSQL with `pgvector`, via a `match_paper_chunks` similarity search function

## Features

- 📄 PDF upload and structured analysis (paper type, core problem, key idea, method, assumptions, limitations, mental model, keywords, pipeline diagram)
- 💬 Chat grounded in the paper's actual retrieved text, with conversation history
- 🔐 Auth via Supabase, email/password or Google OAuth
- 📊 Dashboard showing every paper you've analyzed, question counts, and quick access
- 🗂️ Collections to group papers and filter your dashboard
- 👥 Works fully as a guest with no account needed, or signed in with everything persisted

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (Pages Router), Tailwind CSS, deployed on Vercel |
| Backend | FastAPI (Python), Dockerized, deployed on Google Cloud Run |
| LLM | Groq API, `llama-3.3-70b-versatile` |
| Embeddings | `sentence-transformers` (`all-MiniLM-L6-v2`, ONNX backend) |
| Vector search | ChromaDB (guest sessions), PostgreSQL + `pgvector` (authenticated) |
| Auth & data | Supabase (Postgres, Auth, Row-Level Security) |
| PDF extraction | `pdfplumber` |

## Architecture

```
research-explainer/
├── backend/
│   ├── main.py                  # FastAPI app: /analyze-paper, /chat
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                     # GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
│
└── frontend/
    ├── pages/
    │   ├── index.js              # Landing page
    │   ├── analyze.js            # Upload and analyze a paper
    │   ├── workspace.js          # Analysis view + chat panel
    │   ├── dashboard.js          # Saved papers, stats, collections
    │   ├── login.js               # Email/password + Google OAuth
    │   └── about.js
    ├── components/
    │   ├── Navbar.js
    │   └── MermaidDiagram.js
    ├── utils/
    │   └── supabaseClient.js
    └── .env.local                # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Data model (Supabase / Postgres)

| Table | Purpose |
|---|---|
| `papers` | One row per analyzed paper (owner, filename, extracted text) |
| `analyses` | The structured qualitative breakdown for a paper |
| `paper_chunks` | Chunked text and embeddings, for pgvector retrieval |
| `chat_messages` | Full chat history per paper |
| `collections` | User-created paper groupings |
| `collection_papers` | Join table linking papers to collections |

All tables are protected by Row-Level Security. Every policy restricts access to `auth.uid() = user_id`, directly or via the parent paper or collection.

## Running locally

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
# create a .env with GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
# create a .env.local with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

The frontend defaults to `http://localhost:8000` for the API. Override with `NEXT_PUBLIC_API_URL`.

### Supabase setup

1. Create a Supabase project and enable the `pgvector` extension.
2. Run the schema: tables, RLS policies, and the `match_paper_chunks` function (see `/backend` for the SQL).
3. Go to **Settings → Data API → Exposed tables** and confirm all 6 tables (and the `match_paper_chunks` function) are toggled on. The Data API being disabled per-table is a common silent-failure point that looks like an RLS or auth bug but isn't.
4. Go to **Authentication → URL Configuration** and set your deployed Site URL, adding matching Redirect URLs, or OAuth logins will redirect to `localhost` in production.
5. Go to **Authentication → Providers → Google** and add your Google OAuth Client ID and Secret if you want Google sign-in.

## Known limitations

- **Groq free tier**: 100K tokens/day and 12K tokens/minute per model, on a rolling window rather than a fixed daily reset. Heavy testing can hit this. Each analyze call costs roughly 6 to 9K tokens, and each chat question costs two LLM calls (query expansion plus answer generation). Expect occasional `429` responses under sustained use; consider a paid tier for production traffic.
- **Table and figure extraction**: attempted and dropped. Both layout-based and text-based extraction produced too many false positives and negatives to be reliable. Not currently in the codebase.
- **Google and email accounts are separate identities**: signing in with Google and signing up with email/password using the same address creates two distinct accounts unless account linking is explicitly enabled in Supabase.

## What's next

Planned work, not yet built:

- [ ] Re-analyze button (rerun analysis on stored text without re-upload)
- [ ] References extraction
- [ ] Multi-paper batch analysis
- [ ] Table and figure extraction, revisited with a more robust approach

## Author

**Agnik Patra**, [GitHub](https://github.com/Agnik292005) · [LinkedIn](https://www.linkedin.com/in/agnik-patra-3b197b28a/)
