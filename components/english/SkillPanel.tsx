import { Skill, Level, SKILL_META, LEVEL_META, ChatMsg, Action } from "@/utilities/constants";
import { useVoice, MentorText, TypingDots } from "@/utilities/functions";
import { useState, useRef, useEffect } from "react";

// ── Skill Panel ───────────────────────────────────────
export default function SkillPanel({ skill, level }: { skill: Skill; level: Level }) {
  const meta  = SKILL_META[skill];
  const lvlM  = LEVEL_META[level];
  const { speak, stop, speaking } = useVoice();

  const [exercise,   setExercise]   = useState<string | null>(null);
  const [answer,     setAnswer]     = useState("");
  const [feedback,   setFeedback]   = useState<string | null>(null);
  const [recommend,  setRecommend]  = useState<string | null>(null);
  const [chatHistory,setChatHistory]= useState<ChatMsg[]>([]);
  const [chatInput,  setChatInput]  = useState("");
  const [tab,        setTab]        = useState<"practice"|"recommend"|"chat">("practice");
  const [loading,    setLoading]    = useState<string | null>(null); // which action is loading
  const chatRef     = useRef<HTMLDivElement>(null);
  const answerRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory, loading]);

  async function call(action: Action, extra?: any) {
    setLoading(action);
    try {
      const res = await fetch("/api/english", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, action, level, ...extra }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.response as string;
    } catch (e: any) {
      return `Error: ${e.message}`;
    } finally {
      setLoading(null);
    }
  }

  async function generateExercise() {
    setExercise(null); setFeedback(null); setAnswer("");
    const resp = await call("generate_exercise");
    setExercise(resp);
    setTimeout(() => answerRef.current?.focus(), 300);
  }

  async function submitAnswer() {
    if (!answer.trim() || !exercise) return;
    const resp = await call("evaluate_answer", {
      userMessage:     answer,
      exerciseContext: exercise,
    });
    setFeedback(resp);
  }

  async function getRecommend() {
    if (recommend) { setRecommend(null); return; }
    const resp = await call("recommend");
    setRecommend(resp);
  }

  async function sendChat() {
    if (!chatInput.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: chatInput, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMsg]);
    const inputCopy = chatInput;
    setChatInput("");
    const resp = await call("chat", {
      userMessage: inputCopy,
      history:     [...chatHistory, userMsg],
    });
    setChatHistory(prev => [...prev, { role: "assistant", content: resp, timestamp: new Date().toISOString() }]);
  }

  const TABS = [
    { key: "practice",  label: "Practice",  icon: "◉" },
    { key: "recommend", label: "Study Plan", icon: "◈" },
    { key: "chat",      label: "Ask Mentor", icon: "💬" },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-[#111214] rounded-xl p-1 border border-[#1e2128]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 font-mono text-[10px] py-2 rounded-lg border-none cursor-pointer tracking-widest transition-all"
            style={{
              background: tab === t.key ? meta.color : "transparent",
              color:      tab === t.key ? "#111"      : "#4b5563",
              fontWeight: tab === t.key ? 700         : 400,
            }}>
            <span>{t.icon}</span>{t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── PRACTICE tab ── */}
      {tab === "practice" && (
        <div className="flex flex-col gap-4 flex-1">
          {/* Generate button */}
          <button onClick={generateExercise} disabled={!!loading}
            className="w-full py-3 rounded-xl border-none cursor-pointer font-mono text-[11px] font-semibold tracking-widest text-[#111] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: meta.color }}>
            {loading === "generate_exercise" ? (
              <><span className="animate-spin inline-block">↻</span> GENERATING…</>
            ) : exercise ? (
              <>{meta.icon} NEW EXERCISE</>
            ) : (
              <>{meta.icon} GENERATE EXERCISE</>
            )}
          </button>

          {/* Exercise display */}
          {exercise && (
            <div className="bg-[#111214] rounded-2xl border overflow-hidden" style={{ borderColor: meta.color + "44" }}>
              {/* Listening: split transcript from questions visually */}
              {skill === "listening" && (() => {
                const parts = exercise.split(/QUESTIONS\s*:/i);
                const transcriptPart = parts[0];
                const questionsPart = parts[1] ? "QUESTIONS:\n" + parts[1] : "";
                return (
                  <div>
                    {/* Transcript section */}
                    <div className="px-4 pt-4 pb-3 border-b border-[#1e2128]">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#22d3ee18] text-[#22d3ee] border border-[#22d3ee33] tracking-widest">TRANSCRIPT</span>
                        <button onClick={() => {
                          const text = transcriptPart.replace(/FORMAT\s*:.*/gi,"").replace(/TOPIC\s*:.*/gi,"").replace(/TRANSCRIPT\s*:/i,"").trim();
                          speaking ? stop() : speak(text);
                        }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full border cursor-pointer font-mono text-[9px] font-semibold transition-all"
                          style={{ background: speaking ? "#22d3ee22" : "transparent", borderColor: speaking ? "#22d3ee" : "#374151", color: speaking ? "#22d3ee" : "#4b5563" }}>
                          {speaking ? "■ STOP" : "▶ PLAY"}
                        </button>
                        <span className="font-mono text-[9px] text-[#374151]">{speaking ? "Playing…" : "Listen first, then answer"}</span>
                      </div>
                      <MentorText text={transcriptPart} color={meta.color} />
                    </div>
                    {/* Questions section */}
                    {questionsPart && (
                      <div className="px-4 py-3">
                        <span className="font-mono text-[9px] text-[#374151] tracking-widest block mb-2">COMPREHENSION QUESTIONS</span>
                        <MentorText text={questionsPart} color={meta.color} />
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* Non-listening: show normally */}
              {skill !== "listening" && (
                <div>
                  {/* Listen button for listening skill */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b border-[#1e2128]">
                    <button onClick={() => {
                      const transcript = exercise.split("QUESTIONS:")[0].replace(/TRANSCRIPT\s*:/i,"").trim();
                      speaking ? stop() : speak(transcript);
                    }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer font-mono text-[10px] font-semibold transition-all"
                      style={{ background: speaking ? meta.color+"22" : meta.color+"18", borderColor: meta.color+(speaking?"":"44"), color: meta.color }}>
                      <span>{speaking ? "■" : "▶"}</span>
                      {speaking ? "STOP AUDIO" : "▶ PLAY TRANSCRIPT"}
                    </button>
                    <span className="font-mono text-[9px] text-[#374151]">
                      {speaking ? "🔊 Reading transcript aloud…" : "Listen then answer the questions below"}
                    </span>
                    <div className="ml-auto">
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#22d3ee18] text-[#22d3ee] border border-[#22d3ee33]">
                        🎧 LISTENING
                      </span>
                    </div>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-72">
                    <MentorText text={exercise} color={meta.color} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Answer area */}
          {exercise && (
            <>
              <div>
                <label className="block font-mono text-[10px] tracking-widest mb-1.5" style={{ color: meta.color }}>
                  YOUR ANSWER
                </label>
                <textarea
                  ref={answerRef}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder={meta.placeholder}
                  rows={skill === "writing" ? 8 : 4}
                  className="w-full bg-[#111214] border border-[#2a2d35] rounded-xl px-4 py-3 text-[#e8e3d5] font-mono text-sm outline-none resize-y leading-relaxed placeholder:text-[#374151] transition-colors"
                  style={{ focusBorderColor: meta.color } as any}
                  onFocus={e => e.target.style.borderColor = meta.color}
                  onBlur={e => e.target.style.borderColor = "#2a2d35"}
                />
                <div className="flex justify-between items-center mt-1.5">
                  <span className="font-mono text-[9px] text-[#374151]">{answer.length} chars</span>
                  <span className="font-mono text-[9px] text-[#374151]">Press Submit for AI feedback</span>
                </div>
              </div>
              <button onClick={submitAnswer} disabled={!answer.trim() || !!loading}
                className="w-full py-2.5 rounded-xl border-none cursor-pointer font-mono text-[11px] font-semibold tracking-widest text-[#111] hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: loading === "evaluate_answer" ? "#374151" : meta.color }}>
                {loading === "evaluate_answer" ? "EVALUATING…" : "SUBMIT FOR FEEDBACK"}
              </button>
            </>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="bg-[#111214] rounded-2xl p-5 border overflow-y-auto max-h-125"
              style={{ borderColor: meta.color + "55" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="font-mono text-[10px] tracking-widest" style={{ color: meta.color }}>MENTOR FEEDBACK</span>
              </div>
              <MentorText text={feedback} color={meta.color} />
              <div className="mt-4 pt-3 border-t border-[#1e2128] flex gap-2">
                <button onClick={generateExercise}
                  className="flex-1 py-2 rounded-xl border border-[#2a2d35] bg-transparent font-mono text-[10px] cursor-pointer hover:border-[#374151] transition-colors text-[#6b7280]">
                  NEW EXERCISE
                </button>
                <button onClick={() => { setFeedback(null); setAnswer(""); }}
                  className="flex-1 py-2 rounded-xl border-none font-mono text-[10px] cursor-pointer font-semibold text-[#111] hover:opacity-90 transition-opacity"
                  style={{ background: meta.color }}>
                  TRY AGAIN
                </button>
              </div>
            </div>
          )}

          {!exercise && !loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">{meta.icon}</div>
                <p className="font-mono text-[12px] text-[#374151]">Click to generate your first {meta.label.toLowerCase()} exercise</p>
                <p className="font-mono text-[10px] text-[#2a2d35] mt-1">{lvlM.label} level · {lvlM.cefr}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STUDY PLAN tab ── */}
      {tab === "recommend" && (
        <div className="flex flex-col gap-3 flex-1">
          <button onClick={getRecommend} disabled={!!loading}
            className="w-full py-3 rounded-xl border-none cursor-pointer font-mono text-[11px] font-semibold tracking-widest text-[#111] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: meta.color }}>
            {loading === "recommend" ? (
              <><span className="animate-spin inline-block">↻</span> BUILDING PLAN…</>
            ) : recommend ? "↻ REFRESH PLAN" : "◈ GET STUDY PLAN"}
          </button>
          {recommend && (
            <div className="bg-[#111214] rounded-2xl p-5 border overflow-y-auto flex-1" style={{ borderColor: meta.color + "44" }}>
              <MentorText text={recommend} color={meta.color} />
            </div>
          )}
          {!recommend && !loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-3">◈</div>
                <p className="font-mono text-[12px] text-[#374151]">Get a personalized study plan for {meta.label}</p>
                <p className="font-mono text-[10px] text-[#2a2d35] mt-1">Resources, routines, goals and tips</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHAT tab ── */}
      {tab === "chat" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3 min-h-50 max-h-100">
            {chatHistory.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="font-mono text-[11px] text-[#374151]">Ask your {meta.label} mentor anything</p>
                  <div className="flex flex-col gap-1.5 mt-3">
                    {[
                      `How can I improve my ${skill} faster?`,
                      `What's my biggest weakness at ${LEVEL_META[level].label} level?`,
                      `Give me a ${skill} tip for today`,
                    ].map(q => (
                      <button key={q} onClick={() => { setChatInput(q); }}
                        className="font-mono text-[10px] px-3 py-1.5 rounded-full border border-[#2a2d35] bg-transparent cursor-pointer hover:border-[#374151] transition-colors text-[#4b5563] hover:text-[#9ca3af]">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-start`}>
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono text-[9px]"
                  style={{
                    background: msg.role === "user" ? "#1e2128" : meta.color + "22",
                    border:     `1px solid ${msg.role === "user" ? "#2a2d35" : meta.color + "55"}`,
                    color:      msg.role === "user" ? "#6b7280" : meta.color,
                  }}>
                  {msg.role === "user" ? "U" : "M"}
                </div>
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 border"
                  style={{
                    background:   msg.role === "user" ? "#16181d" : "#111214",
                    borderColor:  msg.role === "user" ? "#2a2d35" : meta.color + "33",
                    borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  }}>
                  {msg.role === "user"
                    ? <p className="font-mono text-xs text-[#c9c4b8]">{msg.content}</p>
                    : <MentorText text={msg.content} color={meta.color} />
                  }
                </div>
              </div>
            ))}
            {loading === "chat" && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono text-[9px]"
                  style={{ background: meta.color + "22", border: `1px solid ${meta.color}55`, color: meta.color }}>M</div>
                <div className="rounded-2xl border px-3 py-2" style={{ borderColor: meta.color + "33", background: "#111214" }}>
                  <TypingDots color={meta.color} />
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="flex gap-2 items-end bg-[#16181d] rounded-xl border border-[#2a2d35] focus-within:border-[#22d3ee] transition-colors p-2"
            style={{ focusWithinBorderColor: meta.color } as any}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder={`Ask your ${meta.label} mentor…`}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-[#c9c4b8] resize-none leading-relaxed py-1 px-1 placeholder:text-[#374151]"
              style={{ maxHeight: "80px", minHeight: "24px", overflowY: "auto" }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 80) + "px";
              }}
            />
            <button onClick={sendChat} disabled={!!loading || !chatInput.trim()}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border-none cursor-pointer transition-all disabled:opacity-40"
              style={{ background: chatInput.trim() && !loading ? meta.color : "#1a1d24" }}>
              <span className="text-sm" style={{ color: chatInput.trim() && !loading ? "#111" : "#374151" }}>↑</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}