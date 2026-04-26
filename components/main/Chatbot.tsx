"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "bot"; content: string; time: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hey! 👋 I'm Aria, your AI assistant. How can I help?", time: now() }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [notif, setNotif] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  function now() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setNotif(false);
    setMessages(prev => [...prev, { role: "user", content: text, time: now() }]);
    setInput("");
    setTyping(true);

    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
    });
    const data = await res.json();
    setTyping(false);
    setMessages(prev => [...prev, { role: "bot", content: data.reply, time: now() }]);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {/* Chat Window */}
      {open && (
        <div style={{
          position: "absolute", bottom: 70, right: 0,
          width: 360, height: 520, background: "#1a1a24",
          borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#6c63ff,#a855f7)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 600, margin: 0, fontSize: 15 }}>Aria · AI Assistant</p>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 12 }}>● Online · Replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                {msg.role === "bot" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div>}
                <div>
                  <div style={{ maxWidth: 240, padding: "10px 14px", borderRadius: 18, fontSize: 13.5, lineHeight: 1.5, background: msg.role === "bot" ? "#252535" : "linear-gradient(135deg,#6c63ff,#a855f7)", color: msg.role === "bot" ? "rgba(255,255,255,0.88)" : "#fff", borderBottomLeftRadius: msg.role === "bot" ? 4 : 18, borderBottomRightRadius: msg.role === "user" ? 4 : 18 }}>{msg.content}</div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "2px 0 0", textAlign: msg.role === "user" ? "right" : "left" }}>{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
                <div style={{ background: "#252535", padding: "10px 16px", borderRadius: 18, borderBottomLeftRadius: 4 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 20, letterSpacing: 3 }}>···</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)} placeholder="Type a message…" style={{ flex: 1, background: "#252535", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 25, padding: "9px 16px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <button onClick={() => sendMessage(input)} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a855f7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => { setOpen(o => !o); setNotif(false); }} style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a855f7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(108,99,255,0.45)", position: "relative", transition: "transform 0.2s" }}>
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {notif && !open && <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#f43f5e", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>1</span>}
      </button>
    </div>
  );
}