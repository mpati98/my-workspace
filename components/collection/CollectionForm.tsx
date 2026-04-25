"use client";
import { INP, TEXTAREA, CATEGORIES } from "@/utilities/constants";
import { ColorPicker } from "@/utilities/elements";

// ── Topic Form ────────────────────────────────────────
export function TopicForm({ title, setTitle, category, setCategory, description, setDescription, coverColor, setCoverColor }: {
  title: string; setTitle: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  coverColor: string; setCoverColor: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">TITLE *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Topic title…" className={INP} />
      </div>
      <div>
        <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">CATEGORY</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className={INP}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">DESCRIPTION *</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What is this topic about?" rows={3} className={TEXTAREA} />
      </div>
      <div>
        <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">COVER COLOR</label>
        <ColorPicker value={coverColor} onChange={setCoverColor} />
      </div>
    </div>
  );
}

// ── SubCard Form ──────────────────────────────────────
export function SubCardForm({ title, setTitle, description, setDescription }: {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">TITLE *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title…" className={INP} />
      </div>
      <div>
        <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">DESCRIPTION *</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Details, notes, or content…" rows={4} className={TEXTAREA} />
      </div>
    </div>
  );
}