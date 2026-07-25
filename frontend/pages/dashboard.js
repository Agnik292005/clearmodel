import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../utils/supabaseClient";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState([]); // includes collection_ids: []
  const [collections, setCollections] = useState([]); // {id, title}
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [error, setError] = useState(null);

  const [activeCollection, setActiveCollection] = useState("all"); // "all" | collection id
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [openMenuPaperId, setOpenMenuPaperId] = useState(null); // "add to collection" dropdown

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const userId = session.user.id;

      const { data: papersData, error: papersError } = await supabase
        .from("papers")
        .select("id, filename, uploaded_at, analyses(paper_type)")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });

      if (papersError) throw papersError;

      const paperList = papersData || [];
      const paperIds = paperList.map((p) => p.id);

      // Question counts
      let questionCounts = {};
      let totalQ = 0;

      if (paperIds.length > 0) {
        const { data: chatData, error: chatError } = await supabase
          .from("chat_messages")
          .select("paper_id, role")
          .in("paper_id", paperIds)
          .eq("role", "user");

        if (chatError) throw chatError;

        (chatData || []).forEach((msg) => {
          questionCounts[msg.paper_id] = (questionCounts[msg.paper_id] || 0) + 1;
          totalQ += 1;
        });
      }

      // Collections owned by user
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("id, title")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (collectionsError) throw collectionsError;

      // Collection <-> paper links
      let collectionMap = {}; // paper_id -> [collection_id, ...]

      if (paperIds.length > 0) {
        const { data: linkData, error: linkError } = await supabase
          .from("collection_papers")
          .select("paper_id, collection_id")
          .in("paper_id", paperIds);

        if (linkError) throw linkError;

        (linkData || []).forEach((row) => {
          if (!collectionMap[row.paper_id]) collectionMap[row.paper_id] = [];
          collectionMap[row.paper_id].push(row.collection_id);
        });
      }

      const enriched = paperList.map((p) => ({
        id: p.id,
        filename: p.filename,
        uploaded_at: p.uploaded_at,
        paper_type: p.analyses?.[0]?.paper_type || "Unknown",
        question_count: questionCounts[p.id] || 0,
        collection_ids: collectionMap[p.id] || [],
      }));

      setPapers(enriched);
      setTotalQuestions(totalQ);
      setCollections(collectionsData || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function createCollection() {
    const title = newCollectionTitle.trim();
    if (!title) return;

    setCreatingCollection(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error: insertError } = await supabase
        .from("collections")
        .insert({ user_id: session.user.id, title })
        .select("id, title")
        .single();

      if (insertError) throw insertError;

      setCollections((prev) => [...prev, data]);
      setNewCollectionTitle("");
    } catch (err) {
      console.error("Create collection error:", err);
      setError(err.message || "Failed to create collection.");
    } finally {
      setCreatingCollection(false);
    }
  }

  async function deleteCollection(collectionId) {
    try {
      const { error: deleteError } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (deleteError) throw deleteError;

      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      setPapers((prev) =>
        prev.map((p) => ({
          ...p,
          collection_ids: p.collection_ids.filter((id) => id !== collectionId),
        }))
      );
      if (activeCollection === collectionId) setActiveCollection("all");
    } catch (err) {
      console.error("Delete collection error:", err);
      setError(err.message || "Failed to delete collection.");
    }
  }

  async function toggleCollectionForPaper(paperId, collectionId) {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    const alreadyIn = paper.collection_ids.includes(collectionId);

    try {
      if (alreadyIn) {
        const { error: removeError } = await supabase
          .from("collection_papers")
          .delete()
          .eq("paper_id", paperId)
          .eq("collection_id", collectionId);

        if (removeError) throw removeError;

        setPapers((prev) =>
          prev.map((p) =>
            p.id === paperId
              ? { ...p, collection_ids: p.collection_ids.filter((id) => id !== collectionId) }
              : p
          )
        );
      } else {
        const { error: addError } = await supabase
          .from("collection_papers")
          .insert({ paper_id: paperId, collection_id: collectionId });

        if (addError) throw addError;

        setPapers((prev) =>
          prev.map((p) =>
            p.id === paperId
              ? { ...p, collection_ids: [...p.collection_ids, collectionId] }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Toggle collection error:", err);
      setError(err.message || "Failed to update collection.");
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function openPaper(paperId) {
    window.location.href = `/workspace?paper_id=${paperId}`;
  }

  const visiblePapers = useMemo(() => {
    if (activeCollection === "all") return papers;
    return papers.filter((p) => p.collection_ids.includes(activeCollection));
  }, [papers, activeCollection]);

  const collectionTitleById = useMemo(() => {
    const map = {};
    collections.forEach((c) => (map[c.id] = c.title));
    return map;
  }, [collections]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar active="/dashboard" />

      <main className="px-6 py-16 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Dashboard
            </h2>
            <p className="mt-3 text-zinc-400">
              Your saved papers and activity.
            </p>
          </div>

          <a
            href="/analyze"
            className="shrink-0 rounded-xl bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-zinc-200 transition"
          >
            + Analyze new paper
          </a>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-16 text-center text-zinc-400">
            <p>Loading your dashboard…</p>
          </div>
        ) : (
          <>
            {/* Stat hero */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-500">Papers analyzed</p>
                <p className="mt-2 text-4xl font-semibold">{papers.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-500">Questions asked</p>
                <p className="mt-2 text-4xl font-semibold">{totalQuestions}</p>
              </div>
            </div>

            {/* Collections */}
            <div className="mt-12">
              <h3 className="text-xl font-medium mb-4">Collections</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveCollection("all")}
                  className={`rounded-full px-4 py-1.5 text-sm border transition ${
                    activeCollection === "all"
                      ? "bg-white text-black border-white"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  All papers
                </button>

                {collections.map((c) => (
                  <div key={c.id} className="group relative">
                    <button
                      onClick={() => setActiveCollection(c.id)}
                      className={`rounded-full pl-4 pr-8 py-1.5 text-sm border transition ${
                        activeCollection === c.id
                          ? "bg-white text-black border-white"
                          : "border-zinc-700 text-zinc-300 hover:bg-zinc-900"
                      }`}
                    >
                      {c.title}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCollection(c.id);
                      }}
                      title="Delete collection"
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 ${
                        activeCollection === c.id ? "text-black" : "text-zinc-400"
                      }`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createCollection()}
                  placeholder="New collection name"
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <button
                  onClick={createCollection}
                  disabled={!newCollectionTitle.trim() || creatingCollection}
                  className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 transition"
                >
                  {creatingCollection ? "Creating…" : "Create"}
                </button>
              </div>
            </div>

            {/* Papers list */}
            <div className="mt-12">
              <h3 className="text-xl font-medium mb-4">
                {activeCollection === "all"
                  ? "Your papers"
                  : collectionTitleById[activeCollection] || "Papers"}
              </h3>

              {visiblePapers.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center">
                  <p className="text-zinc-400">
                    {activeCollection === "all"
                      ? "You haven't analyzed any papers yet."
                      : "No papers in this collection yet."}
                  </p>
                  {activeCollection === "all" && (
                    <a
                      href="/analyze"
                      className="mt-4 inline-block rounded-xl bg-white text-black px-5 py-2 text-sm font-medium hover:bg-zinc-200 transition"
                    >
                      Analyze your first paper
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {visiblePapers.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{p.filename}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                            {p.paper_type && p.paper_type !== "Unknown" && (
                              <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-zinc-300 max-w-[220px] truncate">
                                {p.paper_type.split(",")[0].split(".")[0].trim()}
                              </span>
                            )}
                            <span>{formatDate(p.uploaded_at)}</span>
                            <span>·</span>
                            <span>
                              {p.question_count} question
                              {p.question_count === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenuPaperId(
                                  openMenuPaperId === p.id ? null : p.id
                                )
                              }
                              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900 transition"
                              title="Add to collection"
                            >
                              + Collection
                            </button>

                            {openMenuPaperId === p.id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl z-10 p-1">
                                {collections.length === 0 ? (
                                  <p className="px-3 py-2 text-xs text-zinc-500">
                                    Create a collection first
                                  </p>
                                ) : (
                                  collections.map((c) => {
                                    const checked = p.collection_ids.includes(c.id);
                                    return (
                                      <button
                                        key={c.id}
                                        onClick={() =>
                                          toggleCollectionForPaper(p.id, c.id)
                                        }
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-zinc-900 text-left"
                                      >
                                        <span className="truncate">{c.title}</span>
                                        {checked && <span className="text-xs">✓</span>}
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => openPaper(p.id)}
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900 transition"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}