"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionChannel, ActionEvent } from "@/components/ActionChannel";
import { ProphetPoll, Poll } from "@/components/ProphetPoll";
import { Leaderboard } from "@/components/Leaderboard";
import { Trophy, Users2, ListOrdered, MessageSquare, Menu, Star, Eye } from "lucide-react";
import Image from "next/image";
import { DateRangePicker, validateDateRange } from "@/components/ui/date-picker";
// ... keep existing imports ...
// add dialog + form controls
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add lightweight PartyChat component
function PartyChat({ partyId, me }: { partyId: string; me: string }) {
  type ChatMessage = { id: string; user: string; text: string; ts: number };
  const storageKey = `party_chat_${partyId}`;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setMessages(JSON.parse(raw));
      else setMessages([]);
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  useEffect(() => {
    const el = document.getElementById(`party-chat-scroll-${partyId}`);
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, partyId]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    const msg: ChatMessage = { id: Math.random().toString(36).slice(2), user: me, text: t, ts: Date.now() };
    setMessages((arr) => [...arr, msg]);
    setText("");
  };

  return (
    <div className="flex h-[60vh] max-h-[70vh] rounded-lg border border-[color:var(--steel-700)] overflow-hidden bg-[color:var(--slate-900)]">
      {/* Left: members (discord-esque) */}
      <div className="hidden sm:flex w-44 shrink-0 flex-col border-r border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)]/60">
        <div className="px-3 py-2 text-xs text-[color:var(--text-low)] uppercase tracking-wide">Channel</div>
        <div className="px-3 py-1 text-sm text-[color:var(--text-high)] font-medium"># general</div>
      </div>
      {/* Right: messages */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--steel-700)]">
          <div className="text-sm font-medium"># general</div>
          <div className="text-xs text-[color:var(--text-mid)]">Party chat</div>
        </div>
        {/* Messages */}
        <div id={`party-chat-scroll-${partyId}`} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="text-xs text-[color:var(--text-low)]">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="group flex items-start gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(m.user)}`}
                  alt={m.user}
                  className="h-8 w-8 rounded-full ring-1 ring-[color:var(--steel-700)] object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[color:var(--text-high)]">{m.user}</span>
                    <span className="text-[10px] text-[color:var(--text-low)]">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="mt-1 inline-block rounded-lg bg-[color:var(--neutral-chip)] px-3 py-2 text-sm text-[color:var(--text-high)] border border-[color:var(--steel-700)]">
                    {m.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Input */}
        <div className="border-t border-[color:var(--steel-700)] p-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Message #general"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              className="flex-1"
            />
            <Button onClick={send} className="bg-[color:var(--pp-purple)] text-black">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple mock users for leaderboard and events
const USERS = ["Alex", "Jordan", "Sam", "Taylor", "Riley", "Casey", "Devin", "Kai"] as const;
const GAMES = [
  "LAL @ DEN",
  "BOS @ MIA",
  "GSW @ PHX",
  "NYK @ MIL",
  "KC @ LAC",
  "DAL @ PHI",
  "SF @ SEA",
  "NYJ @ BUF",
];

const initialScores: Record<string, number> = Object.fromEntries(USERS.map((u) => [u, Math.floor(Math.random() * 40)]));

export default function Home() {
  type PartyType = "friendly" | "competitive";
  // party model + collections
  type Party = { id: string; name: string; type: PartyType; startDate: string; endDate: string };
  type PartyPick = {
    id: string;
    game: string; // e.g., "KC @ BUF"
    line: string; // e.g., "o/u 44.5" or "TT o23.5"
    score: string; // e.g., "24-21"
    clock: string; // e.g., "Q4 02:31"
    minsLeft: number; // prioritization key
    takers: string[]; // users in party who tailed this play
    isClutch: boolean; // near hitting late in game
    startAtMs: number; // per-pick lock time (game start)
  };
  type MyPollVote = {
    id: string; // pickId
    pickLabel: string;
    partyName: string;
    choice: "hit" | "chalk";
    status: "pending" | "cashed" | "chalked";
    decidedAt?: number;
  };
  const [myParties, setMyParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const currentParty = useMemo(() => myParties.find(p => p.id === selectedPartyId) || null, [myParties, selectedPartyId]);

  // keep prior single party type for existing logic
  const [party, setParty] = useState<PartyType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("parties");

  // add ui states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState("Alex");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);
  const [openConnections, setOpenConnections] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  // Wallet state
  const [wallet, setWallet] = useState<number>(() => {
    if (typeof window === "undefined") return 100;
    const raw = localStorage.getItem("wallet_balance");
    return raw ? Number(raw) || 100 : 100;
  });
  const [addFundsAmt, setAddFundsAmt] = useState<string>("");
  const [withdrawAmt, setWithdrawAmt] = useState<string>("");
  const [walletError, setWalletError] = useState<string>("");

  // per-party state maps
  const [partyScores, setPartyScores] = useState<Record<string, Record<string, number>>>({});
  const [partyPrizePools, setPartyPrizePools] = useState<Record<string, number>>({});
  const [partyPicks, setPartyPicks] = useState<Record<string, PartyPick[]>>({});

  // Competitive metadata maps
  const [partyBuyIns, setPartyBuyIns] = useState<Record<string, number>>({});
  const [partyAllowedSports, setPartyAllowedSports] = useState<Record<string, string[]>>({});

  // add competitive evaluation settings per-party
  const [evalSettings, setEvalSettings] = useState<Record<string, { limit: number; selected: string[] }>>({});

  // create dialog state
  const [openCreate, setOpenCreate] = useState(false);
  const [partyModalMode, setPartyModalMode] = useState<"create" | "join">("create");
  const [joinCode, setJoinCode] = useState("");
  const [joinBuyIn, setJoinBuyIn] = useState<number>(0);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyType, setNewPartyType] = useState<PartyType>("friendly");
  const [newPartyStart, setNewPartyStart] = useState<string>("");
  const [newPartyEnd, setNewPartyEnd] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");
  // countdown to evaluation lock (party start)
  const [timeToLock, setTimeToLock] = useState<string>("");
  // creation-time eval limit (for competitive)
  const [newEvalLimit, setNewEvalLimit] = useState<number>(5);
  // add competitive create inputs
  const [newBuyIn, setNewBuyIn] = useState<number>(0);
  const ALL_SPORTS = ["NFL", "NBA", "MLB", "NHL"] as const;
  const [newAllowedSports, setNewAllowedSports] = useState<string[]>(["NFL", "NBA"]);
  const [createError, setCreateError] = useState<string>("");
  // add-to-pool amount input
  const [addPoolAmount, setAddPoolAmount] = useState<string>("");
  // invite code display
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [createdParty, setCreatedParty] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<string>("");

  // Pick of the Day state
  type PickOfDay = { id: string; league: string; player: string; prop: string; line: number; game: string; resolved?: boolean; correct?: "over" | "under" } | null;
  const [pickOfDay, setPickOfDay] = useState<PickOfDay>(null);
  const [podChoice, setPodChoice] = useState<"over" | "under" | null>(null);
  const [podStreak, setPodStreak] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem("pod_streak_me");
    return raw ? Number(raw) || 0 : 0;
  });

  // Action tab dialogs: see all picks / per-game / import pick
  const [allPicksOpen, setAllPicksOpen] = useState(false);
  const [gamePicksFor, setGamePicksFor] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importGame, setImportGame] = useState("");
  const [importLine, setImportLine] = useState("");

  // Live events feed
  const [events, setEvents] = useState<ActionEvent[]>([]);
  const [clutch, setClutch] = useState<ActionEvent | null>(null);
  const [clutchStream, setClutchStream] = useState<ActionEvent[]>([]);
  // Parlay feed dialog
  const [parlayFeedOpen, setParlayFeedOpen] = useState(false);
  // Points page selections
  const [myParlayOfDay, setMyParlayOfDay] = useState<string | null>(null);
  const [friendParlayOfDay, setFriendParlayOfDay] = useState<string | null>(null);

  // Persist my parlay selection per-party
  useEffect(() => {
    if (!currentParty) { setMyParlayOfDay(null); return; }
    try {
      const v = localStorage.getItem(`my_parlay_of_day_${currentParty.id}`);
      setMyParlayOfDay(v || null);
    } catch {}
  }, [currentParty]);
  useEffect(() => {
    if (!currentParty) return;
    try { localStorage.setItem(`my_parlay_of_day_${currentParty.id}`, myParlayOfDay || ""); } catch {}
  }, [myParlayOfDay, currentParty]);

  const _allClutchPicks = useMemo(() => {
    // flatten clutch picks across all parties, sort by minsLeft
    const all: Array<PartyPick & { partyName: string }> = [];
    myParties.forEach((p) => {
      (partyPicks[p.id] || []).forEach((pk) => {
        if (pk.isClutch) all.push({ ...pk, partyName: p.name });
      });
    });
    return all.sort((a, b) => a.minsLeft - b.minsLeft);
  }, [partyPicks, myParties]);

  // Prophet poll
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [resolvedOptionId, setResolvedOptionId] = useState<string | null>(null);
  const [myPolls, setMyPolls] = useState<MyPollVote[]>([
    { id: "seed1", pickLabel: "3-leg parlay • SF @ DAL TT o23.5", partyName: "Sunday Sweats", choice: "hit", status: "cashed", decidedAt: Date.now() - 3600_000 },
    { id: "seed2", pickLabel: "2-leg parlay • KC @ BUF o/u 44.5", partyName: "Sunday Sweats", choice: "hit", status: "chalked", decidedAt: Date.now() - 7200_000 },
    { id: "seed3", pickLabel: "4-leg parlay • PHI @ NYG alt spread +3.5", partyName: "Competitive Party", choice: "chalk", status: "pending" },
  ]);

  // Leaderboard / points (scoped per party)
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [me] = useState<string>(USERS[0]);

  // Prize pool mock (per party)
  const [prizePool, setPrizePool] = useState<number>(250);

  // helper: format line into plain english
  const formatLine = useCallback((line: string) => {
    // examples: "o/u 44.5", "TT o23.5"
    const l = line.toLowerCase();
    if (l.startsWith("o/u")) {
      const num = l.replace("o/u", "").trim();
      return { text: `over/under ${num} yards`, num };
    }
    if (l.startsWith("tt o")) {
      const num = l.replace("tt o", "").trim();
      return { text: `team total over ${num} points`, num };
    }
    if (l.startsWith("tt u")) {
      const num = l.replace("tt u", "").trim();
      return { text: `team total under ${num} points`, num };
    }
    return { text: line, num: line.replace(/[^0-9.]/g, "") };
  }, []);

  // vote helpers with scoring + confirmation
  const submitVote = useCallback((opts: { id: string; label: string; partyName: string; choice: "hit" | "chalk"; isClutch?: boolean; }) => {
    const { id, label, partyName, choice, isClutch } = opts;
    setMyPolls((arr)=>[{ id, pickLabel: label, partyName, choice, status: "pending" }, ...arr]);
    setVoteFeedback(`${choice === "hit" ? "Hit" : "Chalk"} submitted`);
    setTimeout(()=> setVoteFeedback(null), 1500);
    // resolve randomly after short delay and award/deduct points
    setTimeout(() => {
      const correct = Math.random() > 0.5 ? "hit" : "chalk";
      const gained = (choice === correct) ? (isClutch ? 15 : 10) : (isClutch ? -8 : -5);
      setScores((s) => ({ ...s, [me]: (s[me] || 0) + gained }));
      setMyPolls((arr) => arr.map(mp => mp.id === id ? { ...mp, status: correct === "hit" ? "cashed" : "chalked", decidedAt: Date.now() } : mp));
    }, 2500);
  }, [me]);


  // when switching selected party, hydrate scoped state
  useEffect(() => {
    if (!currentParty) {
      setParty(null);
      return;
    }
    setParty(currentParty.type);
    setScores((partyScores[currentParty.id]) || initialScores);
    // hydrate prize pool per party
    setPrizePool((partyPrizePools[currentParty.id] ?? 0));
    // load eval settings for this party
    try {
      const raw = localStorage.getItem(`eval_settings_${currentParty.id}`);
      const def = { limit: 5, selected: [] as string[] };
      const parsed = raw ? (JSON.parse(raw) as { limit: number; selected: string[] }) : def;
      const existingIds = (partyPicks[currentParty.id] || []).map(p => p.id);
      const trimmedSel = parsed.selected.filter(id => existingIds.includes(id)).slice(0, Math.max(1, parsed.limit));
      setEvalSettings((m) => ({ ...m, [currentParty.id]: { limit: Math.min(Math.max(1, parsed.limit || 5), 1000), selected: trimmedSel } }));
    } catch {
      setEvalSettings((m) => ({ ...m, [currentParty?.id || ""]: { limit: 5, selected: [] } }));
    }
    // reset transient live state
    setEvents([]);
    setClutch(null);
    setPoll(null);
    setVotedOption(null);
    setResolvedOptionId(null);
  }, [currentParty]);

  // persist eval settings when they change for current party
  useEffect(() => {
    if (!currentParty) return;
    const es = evalSettings[currentParty.id];
    if (!es) return;
    try { localStorage.setItem(`eval_settings_${currentParty.id}`, JSON.stringify(es)); } catch {}
  }, [evalSettings, currentParty]);

  // update countdown until lock (party start)
  useEffect(() => {
    if (!currentParty) { setTimeToLock(""); return; }
    const startMs = new Date(currentParty.startDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = startMs - now;
      if (isNaN(startMs) || diff <= 0) { setTimeToLock("Locked"); return; }
      const d = Math.floor(diff / (24*3600_000));
      const h = Math.floor((diff % (24*3600_000)) / 3600_000);
      const m = Math.floor((diff % 3600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTimeToLock(`${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [currentParty]);

  // persist scoped state back to maps
  useEffect(() => {
    if (!currentParty) return;
    setPartyScores((m) => ({ ...m, [currentParty.id]: scores }));
  }, [scores, currentParty]);
  useEffect(() => {
    if (!currentParty) return;
    setPartyPrizePools((m) => ({ ...m, [currentParty.id]: prizePool }));
  }, [prizePool, currentParty]);

  // tick clock for live per-pick countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulate the Attention Engine producing events
  useEffect(() => {
    if (!party) return;
    const id = setInterval(() => {
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      const game = GAMES[Math.floor(Math.random() * GAMES.length)];
      const isClutch = Math.random() > 0.78; // occasional clutch
      const priority = isClutch ? 10 : Math.floor(5 + Math.random() * 5);
      const ev: ActionEvent = {
        id: Math.random().toString(36).slice(2),
        game,
        user,
        priority,
        isClutch,
        text: isClutch
          ? `${user}'s 3-leg parlay hinges on next play in ${game}!`
          : `${user} needs 2 more rebounds in ${game}`,
      };
      setEvents((arr) => [ev, ...arr].slice(0, 30));
      if (isClutch) {
        if (!clutch) setClutch(ev);
        setClutchStream((arr) => [ev, ...arr].slice(0, 20));
      }
    }, 1600);
    return () => clearInterval(id);
  }, [party, clutch]);

  // Auto-generate Prophet Polls tied to clutch moments
  useEffect(() => {
    if (!clutch) return;
    const endsAt = Date.now() + 10000; // 10s window
    setPoll({
      id: clutch.id,
      question: `Will ${clutch.user}'s clutch parlay hit in ${clutch.game}?`,
      options: [
        { id: "yes_hit", label: "Yes, it hits" },
        { id: "no_miss", label: "No, it misses" },
      ],
      endsAt,
    });
    setVotedOption(null);
    setResolvedOptionId(null);
  }, [clutch]);

  // Resolve poll at end time, award points
  useEffect(() => {
    if (!poll) return;
    const t = setInterval(() => {
      if (Date.now() >= poll.endsAt && !resolvedOptionId) {
        const correct = Math.random() > 0.5 ? "yes_hit" : "no_miss";
        setResolvedOptionId(correct);
        if (votedOption && votedOption === correct) {
          setScores((s) => ({ ...s, [me]: (s[me] || 0) + 10 }));
        }
        // clear clutch focus shortly after resolution
        setTimeout(() => setClutch(null), 1200);
      }
    }, 250);
    return () => clearInterval(t);
  }, [poll, resolvedOptionId, votedOption, me]);

  const handleVote = useCallback((optionId: string) => {
    setVotedOption(optionId);
    if (poll) {
      const choice: "hit" | "chalk" = optionId === "yes_hit" ? "hit" : "chalk";
      const partyName = currentParty ? currentParty.name : "All Parties";
      const label = `Prophet Poll • ${clutch?.game ?? "Live"}`;
      submitVote({ id: poll.id, label, partyName, choice, isClutch: true });
    }
  }, [poll, currentParty, clutch, submitVote]);

  const heroTitle = useMemo(() => {
    if (!currentParty && !party) return "ParlayParty";
    if (currentParty) return currentParty.name;
    if (party === "friendly") return "Friendly Party";
    return "Competitive Party";
  }, [currentParty, party]);

  // helper: generate profile picture per username (deterministic)
  const avatarUrl = useCallback((name: string) => {
    // Show my uploaded photo wherever "me" appears
    if (name === me && profilePhotoUrl) return profilePhotoUrl;
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundType=gradientLinear,gradientRadial&shapeColor=6f4df8,8b5cf6,22c55e,F6C945`;
  }, [me, profilePhotoUrl]);

  // helper: generate a player image for the pick card (deterministic by line)
  const playerImageUrl = useCallback((seed: string) => {
    const s = encodeURIComponent(seed);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}&backgroundColor=0E0F13&mouth=smile,smirk&top=shortHair,shortFlat,shortRound&accessories=round&hairColor=2e3442`;
  }, []);

  // Load persisted profile photo
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("profilePhotoUrl") : null;
    if (saved) setProfilePhotoUrl(saved);
  }, []);

  // load + persist connections (mock)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("connections");
      if (raw) setConnections(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("connections", JSON.stringify(connections)); } catch {}
  }, [connections]);
  // persist wallet
  useEffect(() => {
    try { localStorage.setItem("wallet_balance", String(wallet)); } catch {}
  }, [wallet]);

  // create party handler
  const createParty = () => {
    // validate dates using new validation
    setDateError("");
    setCreateError("");
    const dateValidation = validateDateRange(newPartyStart, newPartyEnd);
    if (!dateValidation.isValid) {
      setDateError(dateValidation.errors.join(', '));
      return;
    }

    const id = Math.random().toString(36).slice(2);
    const defaultName = newPartyType === "friendly" ? "Friendly Party" : "Competitive Party";
    
    // Generate invite code
    const generatedInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const p: Party = { 
      id, 
      name: newPartyName.trim() || defaultName, 
      type: newPartyType, 
      startDate: newPartyStart, 
      endDate: newPartyEnd,
      joinCode: generatedInviteCode,
      maxParticipants: 16,
      currentParticipants: 1,
      members: []
    };
    // competitive validations + wallet charge
    if (newPartyType === "competitive") {
      if (!newBuyIn || newBuyIn <= 0) {
        setCreateError("Enter a valid buy-in amount");
        return;
      }
      if (!newAllowedSports.length) {
        setCreateError("Select at least one allowed sport");
        return;
      }
      if (wallet < newBuyIn) {
        setCreateError("Insufficient funds in wallet for buy-in");
        return;
      }
    }

    setMyParties((arr) => [p, ...arr]);
    setPartyScores((m) => ({ ...m, [id]: { ...initialScores } }));
    if (newPartyType === "competitive") {
      // deduct and seed pool
      setWallet((w) => w - newBuyIn);
      setPartyPrizePools((m) => ({ ...m, [id]: newBuyIn }));
      setPrizePool(newBuyIn);
      setEvalSettings((m) => ({ ...m, [id]: { limit: Math.max(1, Math.min(1000, newEvalLimit || 5)), selected: [] } }));
      setPartyBuyIns((m) => ({ ...m, [id]: newBuyIn }));
      setPartyAllowedSports((m) => ({ ...m, [id]: [...newAllowedSports] }));
    }
    
    // Show invite code
    setInviteCode(generatedInviteCode);
    setCreatedParty({
      name: p.name,
      type: p.type,
      joinCode: generatedInviteCode,
      maxParticipants: 16,
      currentParticipants: 1
    });
    setShowInviteCode(true);
    setSelectedPartyId(id);
    setOpenCreate(false);
    setPartyModalMode("create");
    setNewPartyName("");
    setNewPartyType("friendly");
    setJoinCode("");
    setNewPartyStart("");
    setNewPartyEnd("");
    setNewBuyIn(0);
    setNewAllowedSports(["NFL", "NBA"]);
    setActiveTab("game");
  };

  // join party via code handler (demo parsing: F-xxxx -> friendly, C-xxxx -> competitive)
  const joinParty = () => {
    const code = joinCode.trim();
    if (!code) return;
    const prefix = code[0]?.toUpperCase();
    const t: PartyType = prefix === "C" ? "competitive" : "friendly";
    if (t === "competitive") {
      if (!joinBuyIn || joinBuyIn <= 0) {
        setDateError("Enter the party buy-in to join");
        return;
      }
      if (wallet < joinBuyIn) {
        setDateError("Insufficient wallet funds for buy-in");
        return;
      }
    }
    const id = Math.random().toString(36).slice(2);
    const nameSuffix = code.slice(-4).toUpperCase();
    const today = new Date();
    const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const p: Party = { id, name: `Invite Party ${nameSuffix}`, type: t, startDate: today.toISOString().slice(0,10), endDate: in7.toISOString().slice(0,10) };
    setMyParties((arr) => [p, ...arr]);
    setPartyScores((m) => ({ ...m, [id]: { ...initialScores } }));
    if (t === "competitive") {
      setWallet((w) => w - joinBuyIn);
      setPartyPrizePools((m) => ({ ...m, [id]: joinBuyIn }));
      setPartyBuyIns((m) => ({ ...m, [id]: joinBuyIn }));
      // default allowed sports when joining by code (unknown config)
      setPartyAllowedSports((m) => ({ ...m, [id]: ["NFL", "NBA"] }));
    }
    setSelectedPartyId(id);
    setOpenCreate(false);
    setPartyModalMode("create");
    setJoinCode("");
    setJoinBuyIn(0);
    setActiveTab("game");
  };

  // Generate Pick of the Day when party changes (based on allowed sports)
  useEffect(() => {
    if (!currentParty) { setPickOfDay(null); setPodChoice(null); return; }
    const todayKey = new Date().toISOString().slice(0,10);
    const storageKey = `pod_${currentParty.id}_${todayKey}`;
    const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (saved) { setPickOfDay(JSON.parse(saved)); setPodChoice(null); return; }
    const allowed = partyAllowedSports[currentParty.id] && partyAllowedSports[currentParty.id]!.length > 0 ? partyAllowedSports[currentParty.id]! : ["NFL","NBA"]; 
    const league = allowed[Math.floor(Math.random()*allowed.length)];
    const STARS: Record<string, string[]> = {
      NFL: ["Patrick Mahomes","Christian McCaffrey","Tyreek Hill","Josh Allen"],
      NBA: ["LeBron James","Nikola Jokic","Giannis Antetokounmpo","Luka Doncic"],
      MLB: ["Shohei Ohtani","Aaron Judge","Mookie Betts","Juan Soto"],
      NHL: ["Connor McDavid","Auston Matthews","Nathan MacKinnon","Sidney Crosby"],
    };
    const player = (STARS[league] || STARS.NFL)[Math.floor(Math.random()* (STARS[league]?.length || STARS.NFL.length))];
    const games = ["SF @ DAL","KC @ BUF","PHI @ NYG","MIA @ NE","LAL @ DEN","GSW @ PHX"]; 
    const game = games[Math.floor(Math.random()*games.length)];
    const prop = league === "NBA" ? "Points" : league === "NFL" ? "Passing Yds" : league === "MLB" ? "TB" : "Shots";
    const line = league === "NBA" ? 28 + Math.floor(Math.random()*12) : league === "NFL" ? 265 + Math.floor(Math.random()*80) : 2 + Math.floor(Math.random()*4);
    const pod: PickOfDay = { id: Math.random().toString(36).slice(2), league, player, prop, line, game };
    setPickOfDay(pod);
    try { localStorage.setItem(storageKey, JSON.stringify(pod)); } catch {}
  }, [currentParty, partyAllowedSports]);

  // Persist POD streak
  useEffect(() => {
    try { localStorage.setItem("pod_streak_me", String(podStreak)); } catch {}
  }, [podStreak]);

  const handlePodPick = useCallback((choice: "over" | "under") => {
    if (!pickOfDay || !currentParty) return;
    setPodChoice(choice);
    // resolve after a short delay
    setTimeout(() => {
      const correct: "over" | "under" = Math.random() > 0.5 ? "over" : "under";
      setPickOfDay((p) => p ? { ...p, resolved: true, correct } : p);
      const won = correct === choice;
      setScores((s) => ({ ...s, [me]: (s[me] || 0) + (won ? 12 : 0) }));
      setPodStreak((st) => won ? st + 1 : 0);
    }, 1200);
  }, [pickOfDay, currentParty, me, setScores]);

  // Import pick into party
  const addImportedPick = () => {
    if (!currentParty) return;
    const label = importLine.trim();
    const g = importGame.trim() || ["SF @ DAL","KC @ BUF","PHI @ NYG","MIA @ NE"][Math.floor(Math.random()*4)];
    if (!label) return;
    const newPk = {
      id: Math.random().toString(36).slice(2),
      game: g,
      line: label,
      score: `${10+Math.floor(Math.random()*20)}-${10+Math.floor(Math.random()*20)}`,
      clock: `Q${1+Math.floor(Math.random()*4)} ${String(Math.floor(Math.random()*12)).padStart(2,"0")}:${String(Math.floor(Math.random()*60)).padStart(2,"0")}`,
      minsLeft: 10 + Math.floor(Math.random()*20),
      takers: [me],
      isClutch: false,
      startAtMs: Date.now() + 10*60_000,
    } as PartyPick;
    setPartyPicks((m) => ({ ...m, [currentParty.id]: [newPk, ...(m[currentParty.id] || [])] }));
    setImportGame(""); setImportLine(""); setImportOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[color:var(--ink-950)] text-[color:var(--text-high)]">
      {/* overlay drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[80vw] sm:w-[50vw] bg-[color:var(--slate-900)] border-r border-[color:var(--steel-700)] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} className="h-12 w-12 rounded-full ring-1 ring-[color:var(--steel-700)] object-cover" alt="me" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(avatarSeed)}`} className="h-12 w-12 rounded-full ring-1 ring-[color:var(--steel-700)]" alt="me" />
                )}
                <div className="text-sm">
                  <div className="font-semibold">Profile</div>
                  <div className="text-[color:var(--text-mid)]">Change your avatar</div>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={()=>setDrawerOpen(false)}>Close</Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatarUpload" className="text-xs">Upload profile photo</Label>
                <Input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = typeof reader.result === "string" ? reader.result : null;
                      if (!dataUrl) return;
                      setProfilePhotoUrl(dataUrl);
                      try { localStorage.setItem("profilePhotoUrl", dataUrl); } catch {}
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {profilePhotoUrl && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setProfilePhotoUrl(null);
                      try { localStorage.removeItem("profilePhotoUrl"); } catch {}
                    }}>Remove</Button>
                    <span className="text-xs text-[color:var(--text-low)]">Using uploaded photo</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarSeed" className="text-xs">Or use generated avatar seed</Label>
                <Input id="avatarSeed" value={avatarSeed} onChange={(e)=>setAvatarSeed(e.target.value)} placeholder="Type any name" />
                <p className="text-xs text-[color:var(--text-low)]">Tip: Try your nickname to generate a unique avatar.</p>
              </div>
              <div className="pt-2 border-t border-[color:var(--steel-700)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Settings</div>
                    <div className="text-xs text-[color:var(--text-mid)]">Manage connections</div>
                  </div>
                  <Button size="sm" className="bg-[color:var(--pp-purple)] text-black" onClick={() => setOpenConnections(true)}>
                    Connections
                  </Button>
                </div>
              </div>
              {/* Wallet */}
              <div className="rounded-md border border-[color:var(--steel-700)] bg-[color:var(--slate-900)] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Wallet</div>
                  <Badge className="bg-[color:var(--gold)] text-black">${wallet.toFixed(2)}</Badge>
                </div>
                {walletError && (
                  <p className="mt-2 text-xs text-[color:var(--error)]">{walletError}</p>
                )}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Add funds</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={addFundsAmt} onChange={(e)=>setAddFundsAmt(e.target.value)} placeholder="Amount" className="w-32" />
                      <Button size="sm" className="bg-[color:var(--pp-purple)] text-black" onClick={()=>{
                        setWalletError("");
                        const amt = parseFloat(addFundsAmt);
                        if (isNaN(amt) || amt <= 0) { setWalletError("Enter a valid amount"); return; }
                        setWallet((w)=> w + amt);
                        setAddFundsAmt("");
                      }}>Add</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Withdraw</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={withdrawAmt} onChange={(e)=>setWithdrawAmt(e.target.value)} placeholder="Amount" className="w-32" />
                      <Button size="sm" variant="secondary" onClick={()=>{
                        setWalletError("");
                        const amt = parseFloat(withdrawAmt);
                        if (isNaN(amt) || amt <= 0) { setWalletError("Enter a valid amount"); return; }
                        if (amt > wallet) { setWalletError("Insufficient balance"); return; }
                        setWallet((w)=> w - amt);
                        setWithdrawAmt("");
                      }}>Withdraw</Button>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-[color:var(--text-low)]">Demo wallet. No real payments are processed.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connections Dialog */}
      <Dialog open={openConnections} onOpenChange={setOpenConnections}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connections</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium">Betting apps</div>
              <p className="text-xs text-[color:var(--text-mid)]">Toggle to simulate a connection. Real integrations coming soon.</p>
            </div>
            {[
              { key: "pikket", label: "Pikket" },
              { key: "prizepicks", label: "PrizePicks" },
              { key: "underdog", label: "Underdog" },
            ].map((c) => (
              <label key={c.key} className="flex items-center justify-between rounded-md border border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)] p-2">
                <span className="text-sm text-[color:var(--text-high)]">{c.label}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!connections[c.key]}
                  onChange={(e) => setConnections((m) => ({ ...m, [c.key]: e.target.checked }))}
                />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenConnections(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* header */}
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button onClick={()=>setDrawerOpen(true)} className="p-2 rounded-md bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)]">
            <Menu className="h-4 w-4" />
          </button>
          {/* header logo next to menu */}
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/image-1758951279313.png"
            alt="NONO"
            width={1600}
            height={280}
            priority
            sizes="(min-width: 1024px) 80vw, (min-width: 640px) 90vw, 100vw"
            className="h-20 sm:h-28 md:h-36 lg:h-40 xl:h-48 w-auto object-contain max-w-[100vw]"
          />
          <div className="hidden sm:block truncate">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{heroTitle}</h1>
            <p className="text-xs text-[color:var(--text-mid)]">Live action and polls</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)]">Points {scores[me] ?? 0}</Badge>
          <div className="flex flex-col items-end">
            {currentParty ? (
              <div className="text-right">
                <div className="text-sm font-semibold text-[color:var(--text-high)]">{currentParty.name}</div>
                <div className="text-[10px] text-[color:var(--text-mid)] capitalize">{currentParty.type} party</div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-sm font-semibold text-[color:var(--text-high)]">No party selected</div>
                <div className="text-[10px] text-[color:var(--text-mid)]">Use Parties tab below</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Parties Tab */}
          <TabsContent value="parties" className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Parties</h2>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[color:var(--pp-purple)] text-black">Create / Join</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{partyModalMode === "create" ? "Create Party" : "Join Party"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button variant={partyModalMode === "create" ? "default" : "secondary"} onClick={()=>setPartyModalMode("create")}>Create</Button>
                      <Button variant={partyModalMode === "join" ? "default" : "secondary"} onClick={()=>setPartyModalMode("join")}>Join</Button>
                    </div>
                    {partyModalMode === "create" ? (
                      <>
                        <Label>Name</Label>
                        <Input value={newPartyName} onChange={(e)=>setNewPartyName(e.target.value)} placeholder="Sunday Sweats" />
                        <Label>Type</Label>
                        <Select value={newPartyType} onValueChange={(v)=>setNewPartyType(v as any)}>
                          <SelectTrigger><SelectValue placeholder="Party type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="competitive">Competitive</SelectItem>
                          </SelectContent>
                        </Select>
                        {newPartyType === "competitive" && (
                          <div className="rounded-md border border-[color:var(--steel-700)] bg-[color:var(--slate-900)] p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-[color:var(--text-high)]">Evaluation settings</div>
                              <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">Set at creation</Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <Label className="text-xs">Picks to evaluate</Label>
                              <Input
                                type="number"
                                min={1}
                                max={1000}
                                value={newEvalLimit}
                                onChange={(e)=>setNewEvalLimit(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                                className="w-28"
                              />
                              <span className="text-xs text-[color:var(--text-mid)]">You can't change this later</span>
                            </div>
                            {/* Buy-In */}
                            <div className="mt-3 flex items-center gap-3">
                              <Label className="text-xs">Buy-In ($)</Label>
                              <Input
                                type="number"
                                min={1}
                                value={newBuyIn}
                                onChange={(e)=>setNewBuyIn(Math.max(0, Number(e.target.value) || 0))}
                                className="w-28"
                                placeholder="e.g. 25"
                              />
                              <Badge className="bg-[color:var(--gold)] text-black">Wallet ${wallet.toFixed(2)}</Badge>
                            </div>
                            {/* Allowed Sports */}
                            <div className="mt-3">
                              <Label className="text-xs">Allowed sports</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {ALL_SPORTS.map(s => {
                                  const checked = newAllowedSports.includes(s);
                                  return (
                                    <button
                                      type="button"
                                      key={s}
                                      onClick={()=> setNewAllowedSports(prev => checked ? prev.filter(x=>x!==s) : [...prev, s])}
                                      className={`px-2 py-1 rounded-full text-xs border ${checked ? 'bg-[color:var(--pp-purple)] text-black border-[color:var(--pp-purple)]' : 'bg-[color:var(--neutral-chip)] text-[color:var(--text-high)] border-[color:var(--steel-700)]'}`}
                                    >
                                      {s}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        <DateRangePicker
                          startDate={newPartyStart}
                          endDate={newPartyEnd}
                          onStartDateChange={setNewPartyStart}
                          onEndDateChange={setNewPartyEnd}
                          startDateError={dateError}
                          endDateError={dateError}
                        />
                        {dateError && <p className="text-xs text-[color:var(--error)]">{dateError}</p>}
                        {createError && <p className="text-xs text-[color:var(--error)]">{createError}</p>}
                        <Button onClick={createParty} className="bg-[color:var(--pp-purple)] text-black">Create</Button>
                      </>
                    ) : (
                      <>
                        <Label>Join code</Label>
                        <Input value={joinCode} onChange={(e)=>setJoinCode(e.target.value)} placeholder="F-1234 / C-1234" />
                        {(/^c/i).test(joinCode) && (
                          <div className="space-y-2">
                            <Label className="text-xs">Buy-In required ($)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={1}
                                value={joinBuyIn}
                                onChange={(e)=>setJoinBuyIn(Math.max(0, Number(e.target.value) || 0))}
                                placeholder="e.g. 25"
                                className="w-28"
                              />
                              <Badge className="bg-[color:var(--gold)] text-black">Wallet ${wallet.toFixed(2)}</Badge>
                            </div>
                            <p className="text-[10px] text-[color:var(--text-low)]">This party requires buy-in. Your wallet will be charged on join.</p>
                          </div>
                        )}
                        <Button onClick={joinParty} className="bg-[color:var(--pp-purple)] text-black">Join</Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Invite Code Display Modal */}
              <Dialog open={showInviteCode} onOpenChange={setShowInviteCode}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Party Created Successfully!</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Share this invite code with friends to let them join your party:
                    </p>
                    
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold tracking-wider text-gray-900">
                        {inviteCode}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center">
                      Party: {createdParty?.name} • {createdParty?.type === 'competitive' ? 'Competitive' : 'Friendly'} • 1/16 members
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigator.clipboard.writeText(inviteCode)}
                      >
                        Copy Code
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`)}
                      >
                        Copy Link
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={() => setShowInviteCode(false)} 
                      className="w-full bg-[color:var(--pp-purple)] text-black"
                    >
                      Got it!
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myParties.map((p)=> (
                <Card key={p.id} className={`bg-[color:var(--slate-900)] border-[color:var(--steel-700)] ${p.id===selectedPartyId ? 'ring-2 ring-[color:var(--pp-purple)]' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[color:var(--text-high)] text-base flex items-center gap-2">
                      {p.name}
                      {p.id===selectedPartyId && (
                        <Badge className="bg-[color:var(--pp-purple)] text-black">Selected</Badge>
                      )}
                      {p.type === 'competitive' && (
                        <>
                          <Badge className="bg-[color:var(--gold)] text-black ml-auto">Pool ${((partyPrizePools[p.id] ?? 0)).toFixed?.(2) ?? (partyPrizePools[p.id] ?? 0)}</Badge>
                          {partyBuyIns[p.id] ? (
                            <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">Buy-In ${partyBuyIns[p.id].toFixed?.(2) ?? partyBuyIns[p.id]}</Badge>
                          ) : null}
                        </>
                      )}
                    </CardTitle>
                    {/* Date timeline */}
                    {(() => {
                      const s = new Date(p.startDate).getTime();
                      const e = new Date(p.endDate).getTime();
                      const n = Date.now();
                      const total = Math.max(1, e - s);
                      const pct = Math.max(0, Math.min(100, ((n - s) / total) * 100));
                      const fmt = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      let status: string;
                      if (isNaN(s) || isNaN(e)) {
                        status = "Dates unavailable";
                      } else if (n < s) {
                        const diff = s - n;
                        const d = Math.floor(diff / (24*3600_000));
                        const h = Math.floor((diff % (24*3600_000)) / 3600_000);
                        status = `Starts in ${d}d ${String(h).padStart(2,'0')}h`;
                      } else if (n > e) {
                        status = "Ended";
                      } else {
                        const diff = e - n;
                        const d = Math.floor(diff / (24*3600_000));
                        const h = Math.floor((diff % (24*3600_000)) / 3600_000);
                        status = `${d}d ${String(h).padStart(2,'0')}h left`;
                      }
                      return (
                        <div className="mt-1">
                          <div className="relative h-2.5 rounded-full bg-[color:var(--steel-700)] overflow-hidden">
                            <div className="h-full bg-[color:var(--gold)]" style={{ width: `${pct}%` }} />
                            {/* Today marker dot */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-2.5"
                              style={{ left: `${pct}%` }}
                            >
                              <span className="block h-3 w-3 -translate-x-1/2 rounded-full bg-[color:var(--pp-purple)] ring-2 ring-[color:var(--slate-900)]" />
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <span className="px-2 py-0.5 rounded-full bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">Start • {fmt(s)}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[color:var(--neutral-chip)] text-[color:var(--warning)]">{status}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">End • {fmt(e)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">{p.type}</Badge>
                    <Button size="sm" disabled={p.id===selectedPartyId} onClick={()=>{ setSelectedPartyId(p.id); setActiveTab("game"); }}>
                      {p.id===selectedPartyId ? 'Current' : 'Open'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Game Day Tab */}
          <TabsContent value="game" className="mt-4">
            <div className="space-y-4">
              <Tabs defaultValue="picks" className="w-full">
                <TabsList className="bg-[color:var(--slate-900)] border border-[color:var(--steel-700)] overflow-x-auto no-scrollbar rounded-full px-1">
                  <TabsTrigger value="picks">Party Picks</TabsTrigger>
                  <TabsTrigger value="action">Action Channel</TabsTrigger>
                  <TabsTrigger value="all">All Picks</TabsTrigger>
                </TabsList>

                {/* Party Picks */}
                <TabsContent value="picks" className="space-y-3">
                  {!currentParty ? (
                    <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]"><CardHeader><CardTitle className="text-[color:var(--text-high)]">Select a party</CardTitle></CardHeader></Card>
                  ) : (
                    <div className="space-y-2">
                      {/* Clutch Time - persistent card styled like Action Channel */}
                      <Card className="trophy-edge border-[color:var(--pp-purple)] bg-[color:var(--slate-900)] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-[color:var(--text-high)]">Clutch Time</CardTitle>
                          {clutch ? (
                            <Button
                              size="sm"
                              className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)] hover:bg-[color:var(--pp-purple)] hover:text-black"
                              onClick={() => setClutch(null)}
                            >
                              Dismiss
                            </Button>
                          ) : null}
                        </CardHeader>
                        <Separator className="bg-[color:var(--steel-700)]" />
                        <CardContent className="space-y-3 relative">
                          {/* Radiating pulse bg only when active */}
                          {clutch ? (
                            <div className="pointer-events-none absolute -inset-2 opacity-40">
                              <div className="absolute inset-0 rounded-xl [background:radial-gradient(120px_120px_at_15%_20%,var(--pp-purple),transparent_60%),radial-gradient(160px_160px_at_85%_10%,var(--pp-purple),transparent_60%)] animate-pulse" />
                            </div>
                          ) : null}

                          {clutch ? (
                            <>
                              {/* Header row with avatar overlay */}
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img src={avatarUrl(clutch.user)} alt={clutch.user} className="h-10 w-10 rounded-full ring-2 ring-[color:var(--pp-purple)] object-cover" />
                                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[color:var(--mint)] ring-2 ring-[color:var(--slate-900)]" />
                                </div>
                                <div>
                                  <div className="text-sm text-[color:var(--text-low)]">{clutch.game} • {clutch.user}</div>
                                  <div className="text-xl" style={{ fontFamily: "var(--font-display)" }}>{clutch.text}</div>
                                </div>
                              </div>
                              {/* Live clutch strip - horizontal scroll */}
                              <div className="overflow-x-auto no-scrollbar">
                                <div className="flex gap-3 min-w-max py-1">
                                  {clutchStream.map((c) => (
                                    <div key={c.id} className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)]">
                                      <img src={avatarUrl(c.user)} alt={c.user} className="h-7 w-7 rounded-full ring-1 ring-[color:var(--steel-700)] object-cover" />
                                      <div className="text-xs text-[color:var(--text-mid)]">
                                        <div className="font-medium text-[color:var(--text-high)]">{c.game}</div>
                                        <div>{c.text}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="pt-2">
                                {poll && !votedOption ? (
                                  <ProphetPoll poll={poll} onVote={handleVote} resolvedOptionId={resolvedOptionId} />
                                ) : null}
                              </div>
                            </>
                          ) : (
                            // Empty state to keep layout stable
                            <div className="h-24 flex items-center justify-center text-xs text-[color:var(--text-mid)]">
                              No clutch moments right now
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Live Legs (everyone in current party) */}
                      {(() => {
                        const live = (partyPicks[currentParty.id] || [])
                          .filter(pk => pk.startAtMs <= now)
                          .sort((a,b)=> a.minsLeft - b.minsLeft);
                        if (live.length === 0) {
                          return (
                            <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                              <CardHeader><CardTitle className="text-[color:var(--text-high)]">No live legs right now</CardTitle></CardHeader>
                            </Card>
                          );
                        }
                        return (
                          <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                            <CardHeader>
                              <CardTitle className="text-[color:var(--text-high)] text-base">Live Legs — Everyone</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {live.map((pk)=>{
                                const fl = formatLine(pk.line);
                                const owner = pk.takers[0] || "Friend";
                                const lineNum = parseFloat(fl.num) || 1;
                                const simulated = Math.max(0, Math.min(lineNum, Math.round((lineNum * (100 - pk.minsLeft)) / 100 * 10) / 10));
                                const pct = Math.max(0, Math.min(100, Math.round((simulated / lineNum) * 100)));
                                const parlayPct = Math.min(100, Math.max(10, 30 + (100 - pk.minsLeft * 3)));
                                return (
                                  <div key={pk.id} className={`rounded-lg border p-3 bg-[color:var(--neutral-chip)] border-[color:var(--steel-700)] ${pk.isClutch ? "ring-2 ring-[color:var(--pp-purple)] animate-pulse" : ""}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm text-[color:var(--text-low)]">{pk.game}</div>
                                      <div className="text-xs text-[color:var(--text-mid)]">{pk.clock} • {pk.score}</div>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="relative h-10 w-10 shrink-0">
                                          <img src={playerImageUrl(pk.line)} alt={pk.line} className="h-10 w-10 rounded-md object-cover ring-1 ring-[color:var(--steel-700)]" />
                                          {pk.isClutch && (
                                            <span className="absolute -bottom-1 -right-1 text-[10px] px-1 py-0.5 rounded bg-[color:var(--pp-purple)] text-black">CLUTCH</span>
                                          )}
                                        </div>
                                        <div>
                                          <div className="text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>{fl.text}</div>
                                          <div className="text-[11px] text-[color:var(--text-mid)]">By {owner} • Line {fl.num}</div>
                                        </div>
                                      </div>
                                      <div className="flex -space-x-2">
                                        {pk.takers.map((t)=> (
                                          <img key={t} src={avatarUrl(t)} alt={t} className="h-7 w-7 rounded-full ring-1 ring-[color:var(--steel-700)] bg-[color:var(--slate-900)] object-cover" />
                                        ))}
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-[10px] text-[color:var(--text-mid)]">
                                        <span>Leg progress</span><span>{simulated}/{lineNum} • {pct}%</span>
                                      </div>
                                      <div className="mt-1 h-2 w-full rounded-full bg-[color:var(--steel-700)] overflow-hidden">
                                        <div className="h-full bg-[color:var(--mint)]" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-[10px] text-[color:var(--text-mid)]">
                                        <span>{owner}'s parlay</span><span>{parlayPct}%</span>
                                      </div>
                                      <div className="mt-1 h-1.5 w-full rounded-full bg-[color:var(--steel-700)] overflow-hidden">
                                        <div className="h-full bg-[color:var(--pp-purple)]" style={{ width: `${parlayPct}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </CardContent>
                          </Card>
                        );
                      })()}

                      {/* Parlay of the Day — Summary (based on selections in Points tab) */}
                      {(() => {
                        if (!currentParty) return null;
                        const items: Array<{owner: string; pk: PartyPick}> = [];
                        if (myParlayOfDay) {
                          const pk = (partyPicks[currentParty.id] || []).find(p => p.id === myParlayOfDay);
                          if (pk) items.push({ owner: me, pk });
                        }
                        if (friendParlayOfDay) {
                          const pk = (partyPicks[currentParty.id] || []).find(p => p.id === friendParlayOfDay);
                          const owner = pk?.takers.find(t => t !== me) || pk?.takers[0] || "Friend";
                          if (pk) items.push({ owner: owner!, pk });
                        }
                        if (items.length === 0) return null;
                        return (
                          <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                            <CardHeader>
                              <CardTitle className="text-[color:var(--text-high)] text-base">Picks of the Day — Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {items.map(({ owner, pk }) => {
                                const fl = formatLine(pk.line);
                                const lineNum = parseFloat(fl.num) || 1;
                                const simulated = Math.max(0, Math.min(lineNum, Math.round((lineNum * (100 - pk.minsLeft)) / 100 * 10) / 10));
                                const pct = Math.max(0, Math.min(100, Math.round((simulated / lineNum) * 100)));
                                return (
                                  <div key={`${owner}-${pk.id}`} className="rounded-md border border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)] p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm text-[color:var(--text-low)]">{owner}'s Parlay • {pk.game}</div>
                                      <div className="text-xs text-[color:var(--text-mid)]">{pk.startAtMs <= now ? `${pk.clock} • ${pk.score}` : new Date(pk.startAtMs).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-3">
                                      <img src={playerImageUrl(pk.line)} alt={pk.line} className="h-10 w-10 rounded-md object-cover ring-1 ring-[color:var(--steel-700)]" />
                                      <div>
                                        <div className="text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>{fl.text}</div>
                                        <div className="text-[11px] text-[color:var(--text-mid)]">Line {fl.num}</div>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-[10px] text-[color:var(--text-mid)]">
                                        <span>Leg progress</span><span>{simulated}/{lineNum} • {pct}%</span>
                                      </div>
                                      <div className="mt-1 h-2 w-full rounded-full bg-[color:var(--steel-700)] overflow-hidden">
                                        <div className="h-full bg-[color:var(--mint)]" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </CardContent>
                          </Card>
                        );
                      })()}

                      {/* Party Notes only here */}
                      <Card className="trophy-edge border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                        <CardHeader>
                          <CardTitle className="text-[color:var(--text-high)]">Party Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-[color:var(--text-mid)]">
                          <p>• Prophet Poll wins: +10 points (clutch bonus +5)</p>
                          <p>• Wrong guesses deduct 5 (clutch -8)</p>
                          <p>• In Competitive parties, bragging rights are on the line.</p>
                        </CardContent>
                      </Card>

                      {/* Party Chat at bottom of Party Picks */}
                      <div className="mt-3">
                        <PartyChat partyId={currentParty.id} me={me} />
                      </div>

                      {/* Moved: Points section unique per party (formerly separate tab) */}
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)]">Your Points: {scores[me] ?? 0}</Badge>
                          <Button size="sm" className="bg-[color:var(--pp-purple)] text-black" onClick={() => setActiveTab("leaderboard")}>Open Leaderboard</Button>
                        </div>
                        {pickOfDay && (
                          <Card className="trophy-edge border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                              <CardTitle className="text-[color:var(--text-high)] text-base flex items-center gap-2">
                                <Star className="h-4 w-4 text-[color:var(--gold)]" /> Pick of the Day
                                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--neutral-chip)] px-2 py-0.5 text-[10px] text-[color:var(--text-mid)]">
                                  <Star className="h-3 w-3 text-[color:var(--gold)]" /> Streak {podStreak}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="text-[color:var(--text-mid)]">{pickOfDay.league} • {pickOfDay.game}</div>
                                <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">{pickOfDay.prop}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>{pickOfDay.player}</div>
                                  <div className="text-xs text-[color:var(--text-low)]">Line {pickOfDay.line}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" disabled={!!podChoice} onClick={() => handlePodPick("over")} className="bg-[color:var(--mint)] text-black">Over</Button>
                                  <Button size="sm" disabled={!!podChoice} onClick={() => handlePodPick("under")} className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)] hover:bg-[color:var(--pp-purple)] hover:text-black">Under</Button>
                                </div>
                              </div>
                              {podChoice && (
                                <div className="text-xs text-[color:var(--text-mid)]">
                                  You picked {podChoice.toUpperCase()} {pickOfDay.resolved ? (pickOfDay.correct === podChoice ? "• Correct! +12" : "• Missed") : "• Resolving..."}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                        {/* My Parlay of the Day */}
                        <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                          <CardHeader>
                            <CardTitle className="text-[color:var(--text-high)] text-base">Your Parlay of the Day</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {currentParty ? (
                              (() => {
                                const myNonLive = (partyPicks[currentParty.id] || []).filter(pk => pk.startAtMs > now && pk.takers.includes(me));
                                if (myNonLive.length === 0) return <div className="text-sm text-[color:var(--text-mid)]">No upcoming picks of yours to choose from.</div>;
                                return (
                                  <div className="flex items-center gap-3">
                                    <Select value={myParlayOfDay || undefined} onValueChange={(v) => setMyParlayOfDay(v)}>
                                      <SelectTrigger className="w-full max-w-sm"><SelectValue placeholder="Select your parlay" /></SelectTrigger>
                                      <SelectContent>
                                        {myNonLive.map(pk => (
                                          <SelectItem key={pk.id} value={pk.id}>{pk.game} • {pk.line}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {myParlayOfDay && <Badge className="bg-[color:var(--pp-purple)] text-black">Saved</Badge>}
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="text-sm text-[color:var(--text-mid)]">Select a party first.</div>
                            )}
                          </CardContent>
                        </Card>
                        {/* Friend's Parlay of the Day */}
                        <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                          <CardHeader>
                            <CardTitle className="text-[color:var(--text-high)] text-base">Friend's Parlay of the Day</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {currentParty ? (
                              (() => {
                                const friendNonLive = (partyPicks[currentParty.id] || []).filter(pk => pk.startAtMs > now && !pk.takers.includes(me));
                                if (friendNonLive.length === 0) return <div className="text-sm text-[color:var(--text-mid)]">No upcoming friends' picks to choose from.</div>;
                                return (
                                  <div className="flex items-center gap-3">
                                    <Select value={friendParlayOfDay || undefined} onValueChange={(v) => setFriendParlayOfDay(v)}>
                                      <SelectTrigger className="w-full max-w-sm"><SelectValue placeholder="Select a friend's parlay" /></SelectTrigger>
                                      <SelectContent>
                                        {friendNonLive.map(pk => (
                                          <SelectItem key={pk.id} value={pk.id}>{pk.game} • {pk.line} • by {(pk.takers[0] || "Friend")}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {friendParlayOfDay && <Badge className="bg-[color:var(--pp-purple)] text-black">Saved</Badge>}
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="text-sm text-[color:var(--text-mid)]">Select a party first.</div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="action" className="space-y-4">
                  {/* Live Games (NFL demo) */}
                  <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-[color:var(--text-high)]">Live Games</CardTitle>
                      <div className="flex items-center gap-2">
                        <Dialog open={allPicksOpen} onOpenChange={setAllPicksOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-[color:var(--pp-purple)] text-black"><Eye className="h-4 w-4 mr-1" />See all picks</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>All Picks</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                              {(currentParty ? (partyPicks[currentParty.id] || []) : []).map((pk) => (
                                <div key={pk.id} className="flex items-center justify-between rounded-md border border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)] p-2">
                                  <div className="text-sm">
                                    <div className="font-medium text-[color:var(--text-high)]">{pk.game}</div>
                                    <div className="text-[12px] text-[color:var(--text-mid)]">{pk.line}</div>
                                  </div>
                                  {friendParlayOfDay === pk.id ? (
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" className="bg-[color:var(--mint)] text-black" onClick={()=> submitVote({ id: pk.id, label: `${pk.line} • ${pk.game}`, partyName: currentParty!.name, choice: "hit", isClutch: pk.isClutch })}>Hit</Button>
                                      <Button size="sm" className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)] hover:bg-[color:var(--pp-purple)] hover:text-black" onClick={()=> submitVote({ id: pk.id, label: `${pk.line} • ${pk.game}`, partyName: currentParty!.name, choice: "chalk", isClutch: pk.isClutch })}>Miss</Button>
                                    </div>
                                  ) : (
                                    <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">View only</Badge>
                                  )}
                                </div>
                              ))}
                              {(currentParty && (partyPicks[currentParty.id] || []).length === 0) && (
                                <div className="text-xs text-[color:var(--text-mid)]">No picks yet for this party.</div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {["SF @ DAL","KC @ BUF","PHI @ NYG","MIA @ NE"].map((g) => (
                          <button key={g} onClick={() => setGamePicksFor(g)} className="relative text-left p-3 rounded-lg bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)] overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none opacity-20 [background:radial-gradient(120px_80px_at_20%_20%,var(--pp-purple),transparent_60%)]" />
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-[color:var(--text-mid)]">LIVE</div>
                              <Badge className="bg-[color:var(--pp-purple)] text-black">In Game</Badge>
                            </div>
                            <div className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>{g}</div>
                            <div className="mt-1 text-xs text-[color:var(--text-low)]">Tap to view picks</div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Per-game picks dialog */}
                  <Dialog open={!!gamePicksFor} onOpenChange={(o)=>!o && setGamePicksFor(null)}>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{gamePicksFor || "Game"} • Picks</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {(currentParty ? (partyPicks[currentParty.id] || []).filter(p=>p.game===gamePicksFor) : []).map((pk)=> (
                          <div key={pk.id} className="flex items-center justify-between rounded-md border border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)] p-2">
                            <div className="text-sm">
                              <div className="font-medium text-[color:var(--text-high)]">{pk.line}</div>
                              <div className="text-[12px] text-[color:var(--text-mid)]">{pk.clock} • {pk.score}</div>
                            </div>
                            {friendParlayOfDay === pk.id ? (
                              <div className="flex items-center gap-2">
                                <Button size="sm" className="bg-[color:var(--mint)] text-black" onClick={()=> submitVote({ id: pk.id, label: `${pk.line} • ${pk.game}`, partyName: currentParty!.name, choice: "hit", isClutch: pk.isClutch })}>Hit</Button>
                                <Button size="sm" className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)] hover:bg-[color:var(--pp-purple)] hover:text-black" onClick={()=> submitVote({ id: pk.id, label: `${pk.line} • ${pk.game}`, partyName: currentParty!.name, choice: "chalk", isClutch: pk.isClutch })}>Miss</Button>
                              </div>
                            ) : (
                              <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">View only</Badge>
                            )}
                          </div>
                        ))}
                        {(currentParty && (partyPicks[currentParty.id] || []).filter(p=>p.game===gamePicksFor).length === 0) && (
                          <div className="text-xs text-[color:var(--text-mid)]">No picks yet for this game.</div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Existing ActionChannel feed */}
                  <ActionChannel events={events} onFocusClutch={(e) => setClutch(e)} />

                  {/* Friends' Parlays - dedicated section under Action Channel */}
                  <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                    <CardHeader>
                      <CardTitle className="text-[color:var(--text-high)]">Friends' Parlay Feed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          if (!currentParty) return null;
                          const nowMs = now;
                          const picks = (partyPicks[currentParty.id] || []).filter(pk => !pk.takers.includes(me));
                          const byOwner: Record<string, typeof picks> = {} as any;
                          for (const pk of picks) {
                            const owner = (pk.takers.find(t => t !== me) || pk.takers[0] || "Friend");
                            (byOwner[owner] ||= []).push(pk);
                          }
                          const groups = Object.entries(byOwner).map(([owner, arr]) => {
                            const nextTimes = arr.map(a => (a.startAtMs <= nowMs ? 0 : a.startAtMs - nowMs));
                            const nextUp = nextTimes.length ? Math.min(...nextTimes) : Infinity;
                            return { owner, arr, nextUp };
                          }).sort((a,b)=> a.nextUp - b.nextUp);
                          if (groups.length === 0) return <div className="text-xs text-[color:var(--text-mid)]">No friends' parlays yet.</div>;
                          return groups.map(g => (
                            <div key={g.owner} className="rounded-md border border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)] p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img src={avatarUrl(g.owner)} alt={g.owner} className="h-6 w-6 rounded-full ring-1 ring-[color:var(--steel-700)] object-cover" />
                                  <div className="text-sm font-medium text-[color:var(--text-high)]">{g.owner}'s Parlay</div>
                                </div>
                                <Badge className="bg-[color:var(--pp-purple)] text-black">{g.nextUp === 0 ? "LIVE" : `Starts in ${Math.max(1, Math.ceil(g.nextUp/60000))}m`}</Badge>
                              </div>
                              <div className="mt-2 space-y-2">
                                {g.arr.slice().sort((a,b)=> (a.startAtMs<=nowMs?0:a.startAtMs) - (b.startAtMs<=nowMs?0:b.startAtMs)).map(pk => (
                                  <div key={pk.id} className="flex items-center justify-between rounded border border-[color:var(--steel-700)] bg-[color:var(--ink-950)]/50 p-2">
                                    <div className="text-sm">
                                      <div className="font-medium text-[color:var(--text-high)]">{pk.game}</div>
                                      <div className="text-[12px] text-[color:var(--text-mid)]">{pk.line} • {pk.startAtMs <= nowMs ? `${pk.clock} • ${pk.score}` : new Date(pk.startAtMs).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
                                    </div>
                                    {friendParlayOfDay === pk.id ? (
                                      <div className="flex items-center gap-2">
                                        <Button size="sm" className="bg-[color:var(--mint)] text-black" onClick={()=> submitVote({ id: pk.id, label: `${pk.line} • ${pk.game}`, partyName: currentParty!.name, choice: "hit", isClutch: pk.isClutch })}>Hit</Button>
                                        <Button size="sm" className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)] hover:bg-[color:var(--pp-purple)] hover:text-black" onClick={()=> submitVote({ id: pk.id, label: `${pk.line} • ${pk.game}`, partyName: currentParty!.name, choice: "chalk", isClutch: pk.isClutch })}>Miss</Button>
                                      </div>
                                    ) : (
                                      <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">View only</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Parlays by Person - includes everyone (you + friends) */}
                  <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
                    <CardHeader>
                      <CardTitle className="text-[color:var(--text-high)]">All Parlays by Person</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          if (!currentParty) return null;
                          const nowMs = now;
                          const picks = (partyPicks[currentParty.id] || []);
                          const byOwner: Record<string, typeof picks> = {} as any;
                          for (const pk of picks) {
                            const owner = pk.takers[0] || "Friend";
                            (byOwner[owner] ||= []).push(pk);
                          }
                          const owners = Object.keys(byOwner).sort();
                          if (owners.length === 0) return <div className="text-xs text-[color:var(--text-mid)]">No parlays yet.</div>;
                          return owners.map((owner) => (
                            <div key={owner} className="rounded-md border border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)] p-3">
                              <div className="flex items-center gap-2">
                                <img src={avatarUrl(owner)} alt={owner} className="h-6 w-6 rounded-full ring-1 ring-[color:var(--steel-700)] object-cover" />
                                <div className="text-sm font-medium text-[color:var(--text-high)]">{owner}</div>
                                <Badge className="ml-auto bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">{byOwner[owner].length} legs</Badge>
                              </div>
                              <div className="mt-2 space-y-2">
                                {byOwner[owner]
                                  .slice()
                                  .sort((a,b)=> (a.startAtMs<=nowMs?0:a.startAtMs) - (b.startAtMs<=nowMs?0:b.startAtMs))
                                  .map((pk) => (
                                    <div key={pk.id} className="flex items-center justify-between rounded border border-[color:var(--steel-700)] bg-[color:var(--ink-950)]/50 p-2">
                                      <div className="text-sm">
                                        <div className="font-medium text-[color:var(--text-high)]">{pk.game}</div>
                                        <div className="text-[12px] text-[color:var(--text-mid)]">{pk.line} • {pk.startAtMs <= nowMs ? `${pk.clock} • ${pk.score}` : new Date(pk.startAtMs).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
                                      </div>
                                      <div className="text-[10px] text-[color:var(--text-mid)]">
                                        {pk.startAtMs <= nowMs ? "LIVE" : "UPCOMING"}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-4">
            <Card className="bg-[color:var(--slate-900)] border-[color:var(--steel-700)]">
              <CardHeader>
                <CardTitle className="text-[color:var(--text-high)]">LeaderBoard</CardTitle>
                {currentParty && currentParty.type === "competitive" && (
                  <div className="mt-1 flex items-center gap-2">
                    {(() => {
                      const es = evalSettings[currentParty.id] || { limit: 5, selected: [] as string[] };
                      return (
                        <>
                          <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">Evaluating {Math.min(es.selected.length, es.limit)} / {es.limit} picks</Badge>
                          <Badge className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">Per-pick locks</Badge>
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {currentParty ? (
                  <Leaderboard scores={scores} />
                ) : (
                  <div className="text-sm text-[color:var(--text-mid)]">Select a party first to view its unique leaderboard.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Polls Tab */}
          <TabsContent value="mypolls" className="mt-4 space-y-4">
            <Card className="bg-[color:var(--slate-900)] border-[color:var(--steel-700)]">
              <CardHeader>
                <CardTitle className="text-[color:var(--text-high)]">My Polls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[color:var(--text-mid)]">Your predictions on friends' parlays.</p>
                <div className="space-y-2">
                  {myPolls.map((mp) => (
                    <div key={`${mp.id}-${mp.choice}-${mp.partyName}`} className="flex items-center justify-between rounded-lg border border-[color:var(--steel-700)] bg-[color:var(--neutral-chip)] p-3">
                      <div>
                        <div className="text-sm font-medium text-[color:var(--text-high)]">{mp.pickLabel}</div>
                        <div className="text-xs text-[color:var(--text-low)]">{mp.partyName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={mp.choice === 'hit' ? 'bg-[color:var(--mint)] text-black' : 'bg-[color:var(--pp-purple)] text-black'}>{mp.choice.toUpperCase()}</Badge>
                        <Badge className={mp.status === 'pending' ? 'bg-[color:var(--warning)] text-black' : mp.status === 'cashed' ? 'bg-[color:var(--mint)] text-black' : 'bg-[color:var(--error)] text-black'}>{mp.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[color:var(--steel-700)] bg-[color:var(--slate-900)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--slate-900)]/80">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-4 py-2">
              <button onClick={()=>setActiveTab("game")} className={`flex flex-col items-center gap-1 py-1 ${activeTab==="game"?"text-[color:var(--pp-purple)]":"text-[color:var(--text-mid)]"}`}>
                <Trophy className="h-5 w-5" />
                <span className="text-[10px]">Board</span>
              </button>
              <button onClick={()=>setActiveTab("parties")} className={`flex flex-col items-center gap-1 py-1 ${activeTab==="parties"?"text-[color:var(--pp-purple)]":"text-[color:var(--text-mid)]"}`}>
                <Users2 className="h-5 w-5" />
                <span className="text-[10px]">Parties</span>
              </button>
              <button onClick={()=>setActiveTab("leaderboard")} className={`flex flex-col items-center gap-1 py-1 ${activeTab==="leaderboard"?"text-[color:var(--pp-purple)]":"text-[color:var(--text-mid)]"}`}>
                <ListOrdered className="h-5 w-5" />
                <span className="text-[10px]">Leaders</span>
              </button>
              <button onClick={()=>setActiveTab("mypolls")} className={`flex flex-col items-center gap-1 py-1 ${activeTab==="mypolls"?"text-[color:var(--pp-purple)]":"text-[color:var(--text-mid)]"}`}>
                <MessageSquare className="h-5 w-5" />
                <span className="text-[10px]">Polls</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Vote confirmation chip */}
        {voteFeedback && (
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)] text-xs">
            {voteFeedback}
          </div>
        )}
      </main>
    </div>
  );
}