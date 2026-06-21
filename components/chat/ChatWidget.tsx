"use client";

import { useState, useRef, useEffect } from "react";

type Deal = {
  id: string;
  title: string;
  discount: string | null;
  code: string | null;
  type: "code" | "deal";
  affiliate_url: string;
  store: string;
  storeSlug: string;
  category: string;
};

type Msg =
  | { role: "bot" | "user"; kind: "text"; text: string }
  | { role: "bot"; kind: "deals"; text?: string; deals: Deal[] }
  | { role: "bot"; kind: "chips"; text?: string; chips: { label: string; action: string; value?: string }[] }
  | { role: "bot"; kind: "alerts"; text?: string };

const CATEGORIES = ["Fashion", "Electronics", "Beauty", "Travel", "Food", "Grocery"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [catalog, setCatalog] = useState<Deal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storeMode, setStoreMode] = useState(false);
  const [alertPicks, setAlertPicks] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<string>("");
  const catalogRef = useRef<Deal[]>([]);

  useEffect(() => {
    if (!userRef.current) userRef.current = "u_" + Math.random().toString(36).slice(2, 10);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, open]);

  async function loadCatalog(): Promise<Deal[]> {
    if (loaded && catalogRef.current.length) return catalogRef.current;
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data } = await sb
        .from("coupons")
        .select("id, title, discount, code, type, affiliate_url, is_featured, is_trending, store:stores(name, slug, category)")
        .order("is_featured", { ascending: false })
        .limit(120);
      const mapped: any[] = (data || []).map((c: any) => ({
        id: c.id, title: c.title, discount: c.discount, code: c.code, type: c.type,
        affiliate_url: c.affiliate_url, store: c.store?.name || "", storeSlug: c.store?.slug || "",
        category: c.store?.category || "", _trending: c.is_trending,
      }));
      catalogRef.current = mapped as Deal[];
      setCatalog(mapped as Deal[]);
      setLoaded(true);
      return mapped as Deal[];
    } catch {
      setLoaded(true);
      return [];
    }
  }

  async function ensureCatalog(): Promise<Deal[]> {
    if (catalogRef.current.length) return catalogRef.current;
    return await loadCatalog();
  }

  function pushBot(m: Msg) { setMsgs((prev) => [...prev, m]); }

  function greeting() {
    pushBot({ role: "bot", kind: "text", text: "Hi! I'm your EndOverPay deal finder. How can I help you save today?" });
    pushBot({ role: "bot", kind: "chips", chips: [
      { label: "Find by store", action: "find_store" },
      { label: "Shop by category", action: "shop_category" },
      { label: "Today's top deals", action: "top_deals" },
      { label: "Get deal alerts", action: "alerts" },
    ]});
  }

  function openPanel() {
    setOpen(true);
    loadCatalog();
    if (msgs.length === 0) greeting();
  }

  function getCat(): Deal[] { return catalogRef.current.length ? catalogRef.current : catalog; }
  function dealsForCategory(cat: string): Deal[] {
    return getCat().filter((d) => (d.category || "").toLowerCase() === cat.toLowerCase()).slice(0, 5);
  }
  function topDeals(): Deal[] {
    const list = getCat();
    const t = list.filter((d: any) => d._trending);
    return (t.length ? t : list).slice(0, 5);
  }
  function popularStores(): string[] {
    const seen: string[] = [];
    for (const d of getCat()) { if (d.store && !seen.includes(d.store)) seen.push(d.store); if (seen.length >= 6) break; }
    return seen;
  }
  function dealsForStore(name: string): Deal[] {
    return getCat().filter((d) => d.store.toLowerCase() === name.toLowerCase()).slice(0, 6);
  }

  async function handleChip(action: string, value?: string) {
    await ensureCatalog();
    if (action === "find_store") {
      pushBot({ role: "user", kind: "text", text: "Find by store" });
      const chips = popularStores().map((s) => ({ label: s, action: "store_pick", value: s }));
      chips.push({ label: "Type a store name", action: "store_type", value: "" });
      pushBot({ role: "bot", kind: "chips", text: "Pick a popular store, or type a name:", chips });
    } else if (action === "store_type") {
      setStoreMode(true);
      pushBot({ role: "bot", kind: "text", text: "Type a store name and I'll find matching deals." });
    } else if (action === "store_pick" && value) {
      showStoreDeals(value);
    } else if (action === "shop_category") {
      pushBot({ role: "user", kind: "text", text: "Shop by category" });
      pushBot({ role: "bot", kind: "chips", text: "Which category?", chips: CATEGORIES.map((c) => ({ label: c, action: "category_pick", value: c })) });
    } else if (action === "category_pick" && value) {
      pushBot({ role: "user", kind: "text", text: value });
      const deals = dealsForCategory(value);
      if (deals.length) pushBot({ role: "bot", kind: "deals", text: `Top ${value} deals:`, deals });
      else pushBot({ role: "bot", kind: "text", text: `No live ${value} deals right now â try another category.` });
    } else if (action === "top_deals") {
      pushBot({ role: "user", kind: "text", text: "Today's top deals" });
      pushBot({ role: "bot", kind: "deals", text: "Today's trending deals:", deals: topDeals() });
    } else if (action === "alerts") {
      pushBot({ role: "user", kind: "text", text: "Get deal alerts" });
      setAlertPicks([]);
      pushBot({ role: "bot", kind: "alerts", text: "Pick categories you'd like alerts for:" });
    } else if (action === "menu") {
      greeting();
    }
  }

  function showStoreDeals(name: string) {
    pushBot({ role: "user", kind: "text", text: name });
    setStoreMode(false);
    const deals = dealsForStore(name);
    if (deals.length) {
      pushBot({ role: "bot", kind: "deals", text: `${name} deals:`, deals });
    } else {
      pushBot({ role: "bot", kind: "text", text: `We don't have deals for "${name}" yet.` });
      const chips = popularStores().map((s) => ({ label: s, action: "store_pick", value: s }));
      chips.push({ label: "Shop by category", action: "shop_category", value: "" });
      pushBot({ role: "bot", kind: "chips", text: "Try one of these instead:", chips });
    }
  }

  const storeMatches = storeMode && input.trim().length >= 2
    ? Array.from(new Set(getCat().map((d) => d.store))).filter((s) => s.toLowerCase().includes(input.trim().toLowerCase())).slice(0, 5)
    : [];

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    if (text.toLowerCase() === "stop" || text.toLowerCase() === "unsubscribe") {
      pushBot({ role: "user", kind: "text", text }); setInput("");
      pushBot({ role: "bot", kind: "text", text: "You're unsubscribed from deal alerts." });
      pushBot({ role: "bot", kind: "chips", chips: [{ label: "Back to menu", action: "menu" }] });
      return;
    }
    if (storeMode) { setInput(""); showStoreDeals(text); return; }
    pushBot({ role: "user", kind: "text", text }); setInput(""); setSending(true);
    pushBot({ role: "bot", kind: "text", text: "Let me check…" });
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      setMsgs((prev) => prev.slice(0, -1));
      const deals = (data.dealIds || []).map((id: string) => getCat().find((d) => d.id === id)).filter(Boolean) as Deal[];
      if (deals.length) {
        pushBot({ role: "bot", kind: "deals", text: data.reply, deals });
      } else if (data.action === "show_alerts") {
        setAlertPicks([]); pushBot({ role: "bot", kind: "alerts", text: data.reply });
      } else {
        pushBot({ role: "bot", kind: "text", text: data.reply || "Here's how you can browse:" });
        pushBot({ role: "bot", kind: "chips", chips: [{ label: "Shop by category", action: "shop_category" }, { label: "Today's top deals", action: "top_deals" }] });
      }
    } catch {
      setMsgs((prev) => prev.slice(0, -1));
      pushBot({ role: "bot", kind: "text", text: "Hmm, I couldn't reach the assistant. Try the browse options below." });
      pushBot({ role: "bot", kind: "chips", chips: [{ label: "Back to menu", action: "menu" }] });
    }
    setSending(false);
  }

  function toggleAlertPick(cat: string) {
    setAlertPicks((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  }
  function subscribeAlerts() {
    if (alertPicks.length === 0) return;
    pushBot({ role: "user", kind: "text", text: `Alerts: ${alertPicks.join(", ")}` });
    pushBot({ role: "bot", kind: "text", text: `Done! You'll get alerts for ${alertPicks.join(", ")}. Type "stop" anytime to unsubscribe.` });
    setAlertPicks([]);
  }

  return (
    <>
      <button onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={open ? "Close deal finder chat" : "Open deal finder chat"}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 01-.9-3.8 8.38 8.38 0 018.5-8.5 8.5 8.5 0 018.5 8.5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="EndOverPay deal finder"
          className="fixed z-[60] bg-white shadow-2xl border border-gray-200 flex flex-col font-sans bottom-0 right-0 w-full h-[80vh] rounded-t-2xl sm:bottom-24 sm:right-5 sm:w-[384px] sm:h-[600px] sm:rounded-2xl">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white rounded-t-2xl">
            <div>
              <p className="font-bold text-sm leading-tight">EndOverPay</p>
              <p className="text-[11px] text-white/80 leading-tight">Your deal finder</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {msgs.map((m, i) => (
              <MessageBubble key={i} m={m} userRef={userRef.current} alertPicks={alertPicks} onChip={handleChip} onToggleAlert={toggleAlertPick} onSubscribe={subscribeAlerts} />
            ))}
          </div>

          {storeMode && (
            <div className="px-3 py-1.5 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
              <span className="text-[11px] text-primary-700 font-semibold">Searching stores…</span>
              <button onClick={() => { setStoreMode(false); setInput(""); }} className="text-[11px] text-gray-500 hover:text-gray-700 underline">Cancel</button>
            </div>
          )}

          {storeMatches.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
              {storeMatches.map((s) => (
                <button key={s} onClick={() => { setInput(""); showStoreDeals(s); }} className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full hover:bg-primary-100">{s}</button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder={storeMode ? "Type a store name…" : "Ask me anything…"} aria-label="Type your message"
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-gray-50" />
            <button onClick={handleSend} disabled={sending} aria-label="Send message"
              className="w-9 h-9 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ m, userRef, alertPicks, onChip, onToggleAlert, onSubscribe }: any) {
  if (m.kind === "text") {
    const isUser = m.role === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug ${isUser ? "bg-[#EA580C] text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"}`}>{m.text}</div>
      </div>
    );
  }
  if (m.kind === "chips") {
    return (
      <div className="flex flex-col items-start gap-2">
        {m.text && <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm bg-white border border-gray-100 text-gray-800">{m.text}</div>}
        <div className="flex flex-wrap gap-1.5">
          {m.chips.map((c: any, i: number) => (
            <button key={i} onClick={() => onChip(c.action, c.value)} className="text-xs font-semibold bg-white border border-primary-200 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-300">{c.label}</button>
          ))}
        </div>
      </div>
    );
  }
  if (m.kind === "deals") {
    return (
      <div className="flex flex-col gap-2">
        {m.text && <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm bg-white border border-gray-100 text-gray-800">{m.text}</div>}
        {m.deals.map((d: Deal) => <DealCard key={d.id} deal={d} userRef={userRef} />)}
      </div>
    );
  }
  if (m.kind === "alerts") {
    return (
      <div className="flex flex-col items-start gap-2">
        {m.text && <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm bg-white border border-gray-100 text-gray-800">{m.text}</div>}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const picked = alertPicks.includes(c);
            return (
              <button key={c} onClick={() => onToggleAlert(c)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary-300 ${picked ? "bg-[#EA580C] text-white border-[#EA580C]" : "bg-white text-primary-700 border-primary-200 hover:bg-primary-50"}`}>{picked ? "✓ " : ""}{c}</button>
            );
          })}
        </div>
        <button onClick={onSubscribe} disabled={alertPicks.length === 0} className="mt-1 text-xs font-bold px-4 py-2 rounded-full bg-[#EA580C] text-white disabled:opacity-50 hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-orange-300">Subscribe</button>
      </div>
    );
  }
  return null;
}

function DealCard({ deal, userRef }: { deal: Deal; userRef: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  function handleAction() {
    const url = `/api/redirect?d=${encodeURIComponent(deal.id)}&u=${encodeURIComponent(userRef)}&to=${encodeURIComponent(deal.affiliate_url)}`;
    window.open(url, "_blank");
    setRevealed(true);
  }
  function copyCode() {
    if (deal.code) { navigator.clipboard.writeText(deal.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }
  }
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-bold text-gray-900 truncate">{deal.store}</span>
        {deal.discount && <span className="text-[11px] font-extrabold text-[#9A3412] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">{deal.discount}</span>}
      </div>
      <p className="text-xs text-gray-700 leading-snug mb-2 line-clamp-2">{deal.title}</p>
      {!revealed ? (
        <button onClick={handleAction} className="w-full text-xs font-bold py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white focus:outline-none focus:ring-2 focus:ring-orange-300">{deal.type === "code" ? "Reveal code" : "Get deal"}</button>
      ) : deal.type === "code" && deal.code ? (
        <div className="flex items-stretch gap-1.5">
          <div className="flex-1 font-mono text-sm font-bold text-[#C2410C] bg-orange-50 border-2 border-dashed border-primary-300 rounded-lg px-3 py-1.5 flex items-center justify-center tracking-wider">{deal.code}</div>
          <button onClick={copyCode} aria-label="Copy code" className="px-3 rounded-lg bg-[#1B2433] text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gray-400">{copied ? "Copied!" : "Copy"}</button>
        </div>
      ) : (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-center font-semibold">✓ Discount auto-applied at checkout</p>
      )}
    </div>
  );
}
