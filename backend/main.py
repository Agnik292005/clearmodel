import os
import json
import io
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from groq import Groq
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import chromadb
from sentence_transformers import SentenceTransformer

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2", backend="onnx")
print("Embedding model loaded.")

chroma_client = chromadb.Client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://clearmodel.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_text(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF using pdfplumber."""
    full_text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            full_text += (page.extract_text() or "") + "\n"
    return full_text


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def build_rag_collection(text: str, session_id: str) -> str:
    collection_name = f"paper_{session_id}"
    try:
        chroma_client.delete_collection(collection_name)
    except Exception:
        pass
    collection = chroma_client.create_collection(collection_name)
    chunks = chunk_text(text)
    embeddings = embedder.encode(chunks).tolist()
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )
    return collection_name


def retrieve_relevant_chunks(question: str, collection_name: str, n_results: int = 5) -> str:
    collection = chroma_client.get_collection(collection_name)
    question_embedding = embedder.encode([question]).tolist()
    results = collection.query(
        query_embeddings=question_embedding,
        n_results=min(n_results, collection.count())
    )
    chunks = results["documents"][0]
    return "\n\n---\n\n".join(chunks)


@app.get("/")
def root():
    return {"status": "ClearModel backend running"}


@app.post("/analyze-paper")
async def analyze_paper(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()

    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")

    try:
        text = extract_text(contents)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not read PDF. The file may be corrupted or scanned.")

    if len(text.strip()) < 200:
        raise HTTPException(status_code=422, detail="PDF appears to be a scanned image. Please upload a text-based PDF.")

    session_id = str(uuid.uuid4())[:8]
    collection_name = build_rag_collection(text, session_id)

    analysis_text = text[:20000]

    prompt = f"""You are a world-class research paper analyst and science communicator. Your job is to help a student or early researcher who may have no background in this field genuinely understand a paper they are reading.

Before generating the JSON, internally ask yourself: What TYPE of paper is this?
- Type A: Proposes a single new method or model
- Type B: Compares or evaluates multiple existing methods or strategies
- Type C: Introduces a new dataset or benchmark
- Type D: A survey or review paper
- Type E: A hybrid (e.g. proposes a method AND benchmarks it against others)

Your entire analysis must be tailored to the paper type. A comparison paper must explain EVERY strategy being compared. A method paper must explain the full pipeline in detail. A dataset paper must explain the dataset, annotation process, and what it enables.

IMPORTANT: This analysis must never state specific numbers, percentages, statistics, or metric values anywhere, for any section. Do not include accuracy figures, scores, dataset sizes, epoch counts, or any other exact numeric values. Describe everything qualitatively instead, for example "the model performed strongly across most metrics" or "the dataset is substantially larger than prior work" rather than stating exact figures. Exact numbers are a common source of error when generated this way, so they are intentionally left out of this analysis entirely. Users can ask the chat feature separately for specific numbers, where answers are grounded directly in retrieved excerpts from the paper.

Return ONLY a valid JSON object. No markdown, no backticks, no text outside the JSON. No em dashes anywhere. Use commas or rewrite sentences instead.

{{
  "paper_type": "One of: Method Proposal, Comparative Study, Dataset Paper, Survey, or Hybrid. Then one sentence explaining why.",

  "core_problem": "Write 6 to 8 sentences in flowing prose. Cover all of these: What specific problem does this paper address? Why has this problem not been solved before, what makes it hard? What are the real world consequences if it stays unsolved? Who is concretely affected, doctors, patients, engineers, researchers? Ground every claim in the specific domain of this paper. Do not be vague or generic. No specific numbers anywhere in this field.",

  "key_idea": "Write 6 to 8 sentences. If this is a method paper: what is the novel idea, why is it non-obvious, what insight makes it work, how is it different from prior work? If this is a comparison paper: what question is being answered, why does answering it matter, what did the comparison actually reveal, what is the practical takeaway for someone choosing a method? If this is a dataset paper: what does the dataset provide that did not exist before and why does that matter? Never summarize vaguely. Be specific about what was actually found or contributed, described qualitatively, no exact numbers anywhere in this field.",

  "method": "Write 12 to 16 sentences. This is the most important section. Tailor it completely to the paper type. If method paper: explain the full pipeline from input to output, name every component, explain what each one does in plain English, describe how the components interact, explain the training procedure, and describe what the output looks like. If comparison paper: name and explain EVERY strategy or approach being compared, one by one. For each strategy say what it does differently, what its intuition is, and what its tradeoff is. Then explain how the evaluation was set up and what metrics were used and why, described qualitatively not with exact figures anywhere in this field. If dataset paper: explain the data collection process, annotation methodology, quality checks, and how splits were made, without exact statistics anywhere in this field.",

  "assumptions": [
    {{"assumption": "State the assumption in one clear sentence", "why": "Why the authors had to make this assumption, what constraint forced it", "consequence": "What specifically breaks or becomes invalid if this assumption does not hold in a new setting"}},
    {{"assumption": "...", "why": "...", "consequence": "..."}},
    {{"assumption": "...", "why": "...", "consequence": "..."}},
    {{"assumption": "...", "why": "...", "consequence": "..."}},
    {{"assumption": "...", "why": "...", "consequence": "..."}}
  ],

  "limitations": [
    {{"limitation": "State the limitation precisely", "impact": "The concrete practical consequence for someone trying to use, reproduce, or extend this work"}},
    {{"limitation": "...", "impact": "..."}},
    {{"limitation": "...", "impact": "..."}},
    {{"limitation": "...", "impact": "..."}}
  ],

  "mental_model": "Write 5 to 7 sentences. Pick one concrete real world analogy that maps cleanly onto the core idea. Explicitly map each part of the analogy to a specific part of the paper. Then explain what this mental model reveals that the technical language hides. If this is a comparison paper, the analogy should capture why comparing strategies matters and what the comparison reveals. No em dashes. No specific numbers anywhere in this field.",

  "keywords": [
    {{"term": "exact technical term from this paper", "definition": "2 sentence plain English definition requiring zero prior knowledge. First sentence says what it is. Second sentence says why it matters in the context of this paper."}},
    {{"term": "...", "definition": "..."}},
    {{"term": "...", "definition": "..."}},
    {{"term": "...", "definition": "..."}},
    {{"term": "...", "definition": "..."}},
    {{"term": "...", "definition": "..."}},
    {{"term": "...", "definition": "..."}},
    {{"term": "...", "definition": "..."}}
  ],

  "diagram": "A mermaid diagram that visually represents the actual content of this paper. For a method paper use graph TD showing the pipeline. For a comparison paper use graph TD showing all strategies as parallel branches from a common input, converging to an evaluation node. For a dataset paper show the data collection and annotation pipeline. Rules: never use greater than or less than symbols inside node labels. Never use special characters inside square brackets. Never use pipe characters in arrows. Only use plain arrows like -->. Labels must be plain text only. Minimum 8 nodes. Use real names from the paper."
}}

Critical rules:
- Never use em dashes. Use commas or separate sentences.
- The method section must never give a generic summary. If the paper compares 6 strategies, explain all 6 by name.
- The key_idea must state the actual conclusion or finding of the paper, not just what the paper set out to do.
- ABSOLUTELY NO specific numbers, percentages, or statistics anywhere in this entire response, in any field.
- Never invent architecture details (like layer counts) that are not explicitly stated in the text below.
- Every claim in every section must be traceable to something actually stated or clearly implied in the paper text below. Do not add generic filler claims that could apply to any paper in this field, be specific to what this particular paper actually says.
- Keywords must only include terms that appear in this specific paper and that a beginner would not know.
- The diagram must use only plain --> arrows with no pipe labels.
- Do not hallucinate results. Only state what the paper explicitly reports, described qualitatively.
- paper_type must be identified first and must influence every other field.

Research paper text:
{analysis_text}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
    except Exception as e:
        print(f"ACTUAL ERROR: {repr(e)}")
        error_msg = str(e)
        if "rate_limit" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit reached. Please wait a minute and try again.")
        raise HTTPException(status_code=503, detail="AI service unavailable. Please try again shortly.")

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        result = json.loads(raw.strip())
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed response. Please try again.")

    result["session_id"] = collection_name
    return result


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    session_id: str
    history: List[ChatMessage] = []


@app.post("/chat")
async def chat_with_paper(req: ChatRequest):
    try:
        expansion_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""You are helping search a research paper. Rewrite the following question into specific technical keywords and phrases that would appear verbatim in the paper. Include author names, method names, metric names, or any domain-specific terms relevant to the question. Return only the expanded search query, nothing else, no explanation.

Question: {req.question}"""
            }],
            temperature=0,
        )
        expanded_query = expansion_response.choices[0].message.content.strip()
    except Exception:
        expanded_query = req.question

    try:
        relevant_context = retrieve_relevant_chunks(expanded_query, req.session_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Paper session not found. Please re-upload the paper.")

    system_prompt = """You are a research paper assistant. The user has uploaded a research paper and wants to ask questions about it. You will be given the most relevant excerpts from the paper based on the user question.

Answer accurately and specifically based only on the provided excerpts. If the answer is clearly in the excerpts, give a detailed answer with specific names, numbers, and facts. If you are not confident a specific number or fact appears in the excerpts, say so explicitly rather than guessing. If the answer is not in the excerpts at all, say clearly that this specific information was not found in the retrieved sections and suggest a more specific question.

Formatting: never use markdown syntax such as asterisks, pound signs, or bullet characters, since the interface displays raw text without rendering markdown. However, when listing multiple items, such as several models, methods, or conditions each with their own values, use a clear new line for each item instead of cramming them into one paragraph. For example, write:

ResNet50: accuracy 84.79 percent, precision 0.852, recall 0.830
VGG16: accuracy 80.56 percent, precision 0.807, recall 0.785

rather than combining them into a single flowing sentence. Use plain line breaks and colons to organize information clearly, not markdown symbols."""

    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": f"Here are the most relevant excerpts from the paper:\n\n{relevant_context}\n\nUse these to answer my questions."
        },
        {
            "role": "assistant",
            "content": "I have the relevant excerpts. What would you like to know?"
        },
    ]

    for msg in req.history[-6:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": req.question})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2,
        )
    except Exception as e:
        error_msg = str(e)
        if "rate_limit" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit reached. Please wait a moment.")
        raise HTTPException(status_code=503, detail="AI service unavailable.")

    return {"answer": response.choices[0].message.content}