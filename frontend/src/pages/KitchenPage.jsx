import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  UtensilsCrossed,
  CheckCircle2,
  Search,
  Clock,
  ChevronRight,
} from "lucide-react";

const BASE_URL = "http://localhost:8080";

const getHeaders = () => {
  const token = localStorage.getItem("cafe_admin_token");
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

// Stage helpers — maps backend `stage` field → column
const STAGES = {
  TO_COOK: ["PENDING"],
  PREPARING: ["PREPPING"],
  COMPLETED: ["READY", "SERVED"],
};

const getColumn = (stage) => {
  if (!stage) return "TO_COOK";
  const upper = stage.toUpperCase();
  if (STAGES.TO_COOK.includes(upper)) return "TO_COOK";
  if (STAGES.PREPARING.includes(upper)) return "PREPARING";
  return "COMPLETED";
};

// Status display label
const statusLabel = (s) => {
  switch ((s || "").toUpperCase()) {
    case "PENDING":  return "Pending";
    case "PREPPING": return "Prepping";
    case "READY":    return "Ready";
    case "SERVED":   return "Served";
    case "CANCELLED":return "Cancelled";
    default:         return s;
  }
};

export const KitchenPage = () => {
  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const prev = document.title;
    document.title = "Kitchen Display — Odoo Cafe POS";
    return () => { document.title = prev; };
  }, []);

  const formattedTime = useMemo(() =>
    currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    [currentTime]
  );

  // Tickets state — keyed by orderId for quick merging
  const [tickets, setTickets] = useState({}); // { [orderId]: KitchenTicketResponse }
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  // WebSocket
  const [wsStatus, setWsStatus] = useState("connecting");
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(1000);
  const attemptReconnectRef = useRef(null);

  // Merge / update a ticket into state
  const mergeTicket = useCallback((ticket) => {
    if (!ticket || !ticket.orderId) return;
    setTickets((prev) => ({ ...prev, [ticket.orderId]: ticket }));
  }, []);

  const removeTicket = useCallback((orderId) => {
    setTickets((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }, []);

  // Polling fallback to catch updates that didn't trigger a websocket broadcast
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/api/kitchen-tickets");
        const map = {};
        (data || []).forEach((t) => { map[t.orderId] = t; });
        setTickets(map);
      } catch (err) {
        console.error("KDS periodic load failed", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial load
    load();

    // Poll every 10 seconds
    const intervalId = setInterval(load, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // WebSocket — STOMP over /ws/websocket, subscribes to /topic/kitchen-tickets
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    setWsStatus("connecting");

    const ws = new WebSocket("ws://localhost:8080/ws/websocket");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(["CONNECT", "accept-version:1.1,1.2", "heart-beat:10000,10000", "", "\u0000"].join("\n"));
    };

    ws.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.startsWith("CONNECTED")) {
        setWsStatus("connected");
        reconnectDelayRef.current = 1000;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        ws.send(["SUBSCRIBE", "id:sub-kds", "destination:/topic/kitchen-tickets", "", "\u0000"].join("\n"));
        return;
      }

      if (data.startsWith("MESSAGE")) {
        const parts = data.split("\n\n");
        if (parts.length < 2) return;
        const body = parts.slice(1).join("\n\n").replace(/\0/g, "").trim();
        try {
          const ticket = JSON.parse(body);
          if (!ticket || !ticket.orderId) return;
          // If all items are SERVED or CANCELLED, move to completed; keep in board
          mergeTicket(ticket);
        } catch (e) {
          console.error("WS parse error", e);
        }
      }
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      if (attemptReconnectRef.current) attemptReconnectRef.current();
    };
    ws.onerror = () => ws.close();
  }, [mergeTicket]);

  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
      reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
    }, reconnectDelayRef.current);
  }, [connectWebSocket]);

  useEffect(() => { attemptReconnectRef.current = attemptReconnect; }, [attemptReconnect]);
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  // Advance ticket stage — PATCH /api/kitchen-tickets/{orderId}/advance
  const advanceTicket = useCallback(async (orderId) => {
    try {
      const updated = await apiFetch(`/api/kitchen-tickets/${orderId}/advance`, { method: "PATCH" });
      mergeTicket(updated);
    } catch (err) {
      console.error("Advance stage failed", err);
    }
  }, [mergeTicket]);

  // Update line status — PATCH /api/kitchen-tickets/{orderId}/lines/{lineId}/status
  const updateLineStatus = useCallback(async (orderId, lineId, newStatus) => {
    try {
      const updated = await apiFetch(`/api/kitchen-tickets/${orderId}/lines/${lineId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      mergeTicket(updated);
    } catch (err) {
      console.error("Line status update failed", err);
    }
  }, [mergeTicket]);

  // Derived lists
  const ticketList = useMemo(() => Object.values(tickets), [tickets]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return ticketList;
    return ticketList.filter((t) =>
      t.orderId?.toString().includes(q) ||
      t.tableNumber?.toLowerCase().includes(q) ||
      (t.items || []).some((i) => i.productName?.toLowerCase().includes(q))
    );
  }, [ticketList, searchTerm]);

  const toCook    = useMemo(() => filtered.filter((t) => getColumn(t.stage) === "TO_COOK"),    [filtered]);
  const preparing = useMemo(() => filtered.filter((t) => getColumn(t.stage) === "PREPARING"),  [filtered]);
  const completed = useMemo(() => filtered.filter((t) => getColumn(t.stage) === "COMPLETED"),  [filtered]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F0EDE8] font-sans flex flex-col overflow-hidden select-none">
      {/* HEADER */}
      <header className="h-16 border-b border-[#2E2E2E] bg-[#1A1A1A] px-6 flex items-center justify-between shrink-0 z-10 shadow-card">
        <div className="flex items-center gap-3">
          <ChefHat className="text-[#F5A623]" size={26} />
          <h1 className="font-sora font-bold text-lg tracking-wide">
            Odoo Cafe POS — Kitchen Display
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* WS status pill */}
          {wsStatus === "connected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4CAF7D]/10 text-[#4CAF7D] border border-[#4CAF7D]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF7D]" /> Live
            </span>
          )}
          {wsStatus === "connecting" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623] animate-pulse" /> Connecting...
            </span>
          )}
          {wsStatus === "disconnected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E05C5C]/10 text-[#E05C5C] border border-[#E05C5C]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E05C5C]" /> Reconnecting...
            </span>
          )}
          {/* Clock */}
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#9A9590] bg-[#242424] px-3.5 py-1.5 rounded-lg border border-[#2E2E2E]">
            <Clock size={14} className="text-[#F5A623]" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </header>

      {/* SEARCH ROW */}
      <div className="bg-[#1A1A1A]/50 border-b border-[#2E2E2E] px-6 py-4 shrink-0">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9590]" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order, table or item..."
            className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-[#2E2E2E] rounded-lg text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623]"
          />
        </div>
      </div>

      {/* MAIN BOARD */}
      <main className="flex-1 p-6 overflow-hidden flex gap-6 min-h-0 bg-[#0F0F0F]">
        {loading ? (
          <div className="flex-1 flex gap-6">
            {[1, 2, 3].map((c) => (
              <div key={c} className="flex-1 flex flex-col bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-4 space-y-4">
                <div className="h-6 w-32 bg-[#242424] rounded-md animate-pulse" />
                <div className="flex-1 space-y-3">
                  {[1, 2].map((s) => (
                    <div key={s} className="h-44 bg-[#242424] border border-[#2E2E2E] rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : ticketList.length === 0 ? (
          <div className="flex-1 bg-[#1A1A1A]/30 border border-dashed border-[#2E2E2E] rounded-2xl flex flex-col items-center justify-center text-center p-12">
            <div className="h-16 w-16 rounded-full bg-[#242424] border border-[#2E2E2E] flex items-center justify-center mb-4 text-[#9A9590]">
              <ChefHat size={32} />
            </div>
            <h3 className="font-sora font-semibold text-lg text-[#F0EDE8] mb-1">
              Waiting for orders...
            </h3>
            <p className="text-sm text-[#9A9590] max-w-sm">
              New tickets submitted by cashier terminals will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
            {/* TO COOK */}
            <KdsColumn
              label="To Cook"
              color="#E05C5C"
              tickets={toCook}
              onAdvance={advanceTicket}
              onLineStatus={updateLineStatus}
            />
            {/* PREPARING */}
            <KdsColumn
              label="Preparing"
              color="#F5A623"
              tickets={preparing}
              onAdvance={advanceTicket}
              onLineStatus={updateLineStatus}
            />
            {/* COMPLETED */}
            <KdsColumn
              label="Completed"
              color="#4CAF7D"
              tickets={completed}
              onAdvance={advanceTicket}
              onLineStatus={updateLineStatus}
              faded
            />
          </div>
        )}
      </main>
    </div>
  );
};

// ──────────────────────────────────────────────
// Column component
// ──────────────────────────────────────────────
const KdsColumn = ({ label, color, tickets, onAdvance, onLineStatus, faded = false }) => (
  <div className="flex-1 flex flex-col min-w-0 bg-[#1A1A1A]/40 border border-[#2E2E2E] rounded-2xl p-4">
    <div className="flex items-center justify-between pb-3 border-b border-[#2E2E2E] mb-4">
      <h3 className="font-sora font-bold text-sm flex items-center gap-2" style={{ color }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </h3>
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
        style={{ color, backgroundColor: `${color}20`, borderColor: `${color}40` }}
      >
        {tickets.length}
      </span>
    </div>
    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
      <AnimatePresence mode="popLayout">
        {tickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#9A9590]">
            {label === "To Cook" && <UtensilsCrossed size={28} className="mb-2 opacity-40" />}
            {label === "Preparing" && <ChefHat size={28} className="mb-2 opacity-40" />}
            {label === "Completed" && <CheckCircle2 size={28} className="mb-2 opacity-40" />}
            <p className="text-xs font-semibold">No tickets</p>
          </div>
        ) : (
          tickets.map((t) => (
            <KdsCard
              key={t.orderId}
              ticket={t}
              onAdvance={onAdvance}
              onLineStatus={onLineStatus}
              faded={faded}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// Ticket Card component
// ──────────────────────────────────────────────
const KdsCard = ({ ticket, onAdvance, onLineStatus, faded = false }) => {
  const items = ticket.items || [];
  const activeItems = items.filter((i) => i.status !== "CANCELLED");

  const stripeColor = useMemo(() => {
    if (activeItems.length === 0) return "#2E2E2E";
    const first = activeItems[0].categoryColorHex;
    const mixed = activeItems.some((i) => i.categoryColorHex !== first);
    return mixed ? "#9A9590" : (first || "#2E2E2E");
  }, [activeItems]);

  // Determine next status for an item click
  const nextStatus = (current) => {
    switch ((current || "").toUpperCase()) {
      case "PENDING":  return "PREPPING";
      case "PREPPING": return "READY";
      case "READY":    return "SERVED";
      default:         return null;
    }
  };

  return (
    <motion.div
      layoutId={`card-${ticket.orderId}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: faded ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-card hover:border-[#F5A623]/30 transition-all"
    >
      {/* Color strip */}
      <div className="h-1 w-full" style={{ backgroundColor: stripeColor }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-sora font-bold text-base text-[#F0EDE8]">Order #{ticket.orderId}</h4>
            <p className="text-xs font-semibold text-[#9A9590] mt-0.5">
              Table {ticket.tableNumber || "—"}
              {ticket.customerName && ticket.customerName !== "Guest" && (
                <span className="ml-2 text-[#F5A623]/70">· {ticket.customerName}</span>
              )}
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#9A9590] font-semibold bg-[#242424] px-2 py-0.5 border border-[#2E2E2E] rounded-md">
            {ticket.stage}
          </span>
        </div>

        {/* Items */}
        <div className="border-t border-[#2E2E2E]/50 pt-2.5 space-y-1.5">
          {activeItems.map((item) => {
            const isDone = item.status === "SERVED" || item.status === "READY";
            const next = nextStatus(item.status);
            return (
              <div
                key={item.lineId}
                onClick={next ? () => onLineStatus(ticket.orderId, item.lineId, next) : undefined}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors group/row ${
                  next ? "hover:bg-[#242424]/50 cursor-pointer" : "cursor-default opacity-60"
                }`}
              >
                <span className={`text-sm font-medium transition-all select-none ${
                  isDone ? "line-through text-[#9A9590]" : "text-[#F0EDE8] group-hover/row:text-[#F5A623]"
                }`}>
                  {item.productName}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    item.status === "PENDING"   ? "bg-[#E05C5C]/10 text-[#E05C5C] border-[#E05C5C]/30" :
                    item.status === "PREPPING"  ? "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30" :
                    item.status === "READY"     ? "bg-[#4CAF7D]/10 text-[#4CAF7D] border-[#4CAF7D]/30" :
                    item.status === "SERVED"    ? "bg-[#3D3D3D] text-[#9A9590] border-[#2E2E2E]" :
                    "bg-[#2E2E2E] text-[#9A9590] border-[#2E2E2E]"
                  }`}>
                    {statusLabel(item.status)}
                  </span>
                  <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md ${
                    isDone ? "bg-[#2E2E2E] text-[#9A9590]" : "bg-[#3D2B00] text-[#F5A623] border border-[#F5A623]/20"
                  }`}>
                    ×{item.qty}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advance Stage Button */}
        {ticket.stage !== "SERVED" && (
          <button
            onClick={() => onAdvance(ticket.orderId)}
            className="w-full mt-1 h-8 rounded-lg border border-[#2E2E2E] hover:border-[#F5A623]/50 bg-[#242424] hover:bg-[#3D2B00] text-xs font-semibold text-[#9A9590] hover:text-[#F5A623] transition-all flex items-center justify-center gap-1 focus:outline-none"
          >
            Advance Stage <ChevronRight size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
