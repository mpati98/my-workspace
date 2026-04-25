"use client";

import { TopicCard } from "@/components/collection/CollectionCard";
import { TopicForm, SubCardForm } from "@/components/collection/CollectionForm";
import { COVER_PRESETS, SubCard, Topic } from "@/utilities/constants";
import { CollectionModal, ConfirmDelete } from "@/utilities/modal";
import { useState } from "react";

// ── Main Page ─────────────────────────────────────────
export default function CollectionPage({ initialTopics }: { initialTopics: Topic[] }) {
  const [topics, setTopics]   = useState<Topic[]>(initialTopics);
  const [search, setSearch]   = useState("");

  // Modal states
  const [showNewTopic,   setShowNewTopic]   = useState(false);
  const [editTopic,      setEditTopic]      = useState<Topic | null>(null);
  const [deleteTopic,    setDeleteTopic]    = useState<Topic | null>(null);
  const [addSubTopicId,  setAddSubTopicId]  = useState<string | null>(null);
  const [editSub,        setEditSub]        = useState<SubCard | null>(null);
  const [deleteSub,      setDeleteSub]      = useState<SubCard | null>(null);

  // Form state — topic
  const [tTitle,    setTTitle]    = useState("");
  const [tCat,      setTCat]      = useState("Research");
  const [tDesc,     setTDesc]     = useState("");
  const [tColor,    setTColor]    = useState(COVER_PRESETS[0]);
  const [tLoading,  setTLoading]  = useState(false);

  // Form state — subcard
  const [sTitle,    setSTitle]    = useState("");
  const [sDesc,     setSDesc]     = useState("");
  const [sLoading,  setSLoading]  = useState(false);

  function resetTopicForm(t?: Topic) {
    setTTitle(t?.title ?? "");
    setTCat(t?.category ?? "Research");
    setTDesc(t?.description ?? "");
    setTColor(t?.coverColor ?? COVER_PRESETS[0]);
  }
  function resetSubForm(s?: SubCard) {
    setSTitle(s?.title ?? "");
    setSDesc(s?.description ?? "");
  }

  // ── Topic CRUD ──────────────────────────────────────
  async function handleCreateTopic() {
    if (!tTitle || !tDesc) return;
    setTLoading(true);
    const res = await fetch("/api/topics", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: tTitle, category: tCat, description: tDesc, coverColor: tColor }),
    });
    if (res.ok) { const t: Topic = await res.json(); setTopics(prev => [t, ...prev]); }
    setTLoading(false); setShowNewTopic(false);
  }

  async function handleUpdateTopic() {
    if (!editTopic || !tTitle || !tDesc) return;
    setTLoading(true);
    const res = await fetch(`/api/topics/${editTopic.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: tTitle, category: tCat, description: tDesc, coverColor: tColor }),
    });
    if (res.ok) {
      const updated: Topic = await res.json();
      setTopics(prev => prev.map(t => t.id === editTopic.id ? updated : t));
    }
    setTLoading(false); setEditTopic(null);
  }

  async function handleDeleteTopic() {
    if (!deleteTopic) return;
    await fetch(`/api/topics/${deleteTopic.id}`, { method: "DELETE" });
    setTopics(prev => prev.filter(t => t.id !== deleteTopic.id));
    setDeleteTopic(null);
  }

  // ── SubCard CRUD ────────────────────────────────────
  async function handleCreateSub() {
    if (!addSubTopicId || !sTitle || !sDesc) return;
    setSLoading(true);
    const res = await fetch("/api/subcards", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: sTitle, description: sDesc, topicId: addSubTopicId }),
    });
    if (res.ok) {
      const sub: SubCard = await res.json();
      setTopics(prev => prev.map(t => t.id === addSubTopicId
        ? { ...t, subCards: [...t.subCards, sub] } : t));
    }
    setSLoading(false); setAddSubTopicId(null);
  }

  async function handleUpdateSub() {
    if (!editSub || !sTitle || !sDesc) return;
    setSLoading(true);
    const res = await fetch(`/api/subcards/${editSub.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: sTitle, description: sDesc }),
    });
    if (res.ok) {
      const updated: SubCard = await res.json();
      setTopics(prev => prev.map(t => ({
        ...t, subCards: t.subCards.map(s => s.id === editSub.id ? updated : s),
      })));
    }
    setSLoading(false); setEditSub(null);
  }

  async function handleDeleteSub() {
    if (!deleteSub) return;
    await fetch(`/api/subcards/${deleteSub.id}`, { method: "DELETE" });
    setTopics(prev => prev.map(t => ({
      ...t, subCards: t.subCards.filter(s => s.id !== deleteSub.id),
    })));
    setDeleteSub(null);
  }

  // ── Filter ──────────────────────────────────────────
  const q = search.toLowerCase();
  const visible = topics.filter(t =>
    !q ||
    t.title.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.subCards.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
  );

  const totalCards = topics.reduce((acc, t) => acc + t.subCards.length, 0);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .topic-item { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="min-h-screen bg-[#111214] px-4 py-7 sm:px-8 sm:py-9 mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">WORKSPACE</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#e8e3d5] leading-none mb-1.5"
              style={{ fontFamily: "'Playfair Display', serif" }}>Collections</h1>
            <p className="font-mono text-[11px] text-[#4b5563]">
              {topics.length} {topics.length === 1 ? "topic" : "topics"} · {totalCards} {totalCards === 1 ? "card" : "cards"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search topics…"
                className="bg-[#16181d] border border-[#2a2d35] rounded-xl pl-8 pr-4 py-2 text-[#e8e3d5] font-mono text-xs outline-none focus:border-[#a78bfa] transition-colors placeholder:text-[#374151] w-48 sm:w-56"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#374151] text-sm">⌕</span>
            </div>

            {/* Create topic */}
            <button
              onClick={() => { resetTopicForm(); setShowNewTopic(true); }}
              className="flex items-center gap-2 bg-[#a78bfa] text-[#111] border-none cursor-pointer font-mono text-[11px] font-semibold px-4 py-2 rounded-full tracking-widest hover:opacity-90 transition-opacity"
            >
              + NEW TOPIC
            </button>
          </div>
        </div>

        {/* Topics grid */}
        {visible.length > 0 ? (
          <div className="flex flex-col gap-6">
            {visible.map((topic, i) => (
              <div key={topic.id} className="topic-item" style={{ animationDelay: Math.min(i * 0.06, 0.3) + "s" }}>
                <TopicCard
                  topic={topic}
                  onEditTopic={t => { resetTopicForm(t); setEditTopic(t); }}
                  onDeleteTopic={setDeleteTopic}
                  onAddSub={id => { resetSubForm(); setAddSubTopicId(id); }}
                  onEditSub={s => { resetSubForm(s); setEditSub(s); }}
                  onDeleteSub={setDeleteSub}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4 text-[#2a2d35]">◈</div>
            <p className="font-mono text-[13px] text-[#374151] mb-1">
              {search ? "No topics match your search." : "No topics yet."}
            </p>
            {!search && (
              <button
                onClick={() => { resetTopicForm(); setShowNewTopic(true); }}
                className="mt-4 bg-[#a78bfa] text-[#111] border-none cursor-pointer font-mono text-[11px] font-semibold px-5 py-2.5 rounded-full tracking-widest hover:opacity-90 transition-opacity"
              >
                + CREATE YOUR FIRST TOPIC
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────── */}

      {showNewTopic && (
        <CollectionModal title="NEW TOPIC" onClose={() => setShowNewTopic(false)}
          onSubmit={handleCreateTopic} loading={tLoading} submitLabel="CREATE TOPIC">
          <TopicForm title={tTitle} setTitle={setTTitle} category={tCat} setCategory={setTCat}
            description={tDesc} setDescription={setTDesc} coverColor={tColor} setCoverColor={setTColor} />
        </CollectionModal>
      )}

      {editTopic && (
        <CollectionModal title="EDIT TOPIC" onClose={() => setEditTopic(null)} accentColor={editTopic.coverColor}
          onSubmit={handleUpdateTopic} loading={tLoading} submitLabel="SAVE CHANGES">
          <TopicForm title={tTitle} setTitle={setTTitle} category={tCat} setCategory={setTCat}
            description={tDesc} setDescription={setTDesc} coverColor={tColor} setCoverColor={setTColor} />
        </CollectionModal>
      )}

      {deleteTopic && (
        <ConfirmDelete
          name={deleteTopic.title}
          onConfirm={handleDeleteTopic}
          onCancel={() => setDeleteTopic(null)} color={""}        />
      )}

      {addSubTopicId && (
        <CollectionModal title="ADD CARD" onClose={() => setAddSubTopicId(null)}
          onSubmit={handleCreateSub} loading={sLoading} submitLabel="ADD CARD"
          accentColor={topics.find(t => t.id === addSubTopicId)?.coverColor}>
          <SubCardForm title={sTitle} setTitle={setSTitle} description={sDesc} setDescription={setSDesc} />
        </CollectionModal>
      )}

      {editSub && (
        <CollectionModal title="EDIT CARD" onClose={() => setEditSub(null)}
          onSubmit={handleUpdateSub} loading={sLoading} submitLabel="SAVE CHANGES"
          accentColor={topics.find(t => t.subCards.some(s => s.id === editSub.id))?.coverColor}>
          <SubCardForm title={sTitle} setTitle={setSTitle} description={sDesc} setDescription={setSDesc} />
        </CollectionModal>
      )}

      {deleteSub && (
        <ConfirmDelete
          name={deleteSub.title}
          onConfirm={handleDeleteSub}
          onCancel={() => setDeleteSub(null)} color={""}        />
      )}
    </>
  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/topics`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    const initialTopics = await res.json();
    return { props: { initialTopics } };
  } catch (error) {
    console.error('Error fetching topics:', error);
    return { props: { initialTopics: [] } };
  }
}