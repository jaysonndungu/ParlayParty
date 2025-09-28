import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authAPI } from '@/services/authAPI';

// Simple in-memory storage for development
const mockStorage = {
  data: {} as Record<string, string>,
  getItem: (key: string) => Promise.resolve(mockStorage.data[key] || null),
  setItem: (key: string, value: string) => Promise.resolve(mockStorage.data[key] = value),
  removeItem: (key: string) => Promise.resolve(delete mockStorage.data[key]),
};

type PartyType = 'friendly' | 'competitive';
export type Party = { id: string; name: string; type: PartyType; startDate: string; endDate: string };
export type ActionEvent = { id: string; game: string; user: string; priority: number; isClutch: boolean; text: string };
export type Poll = { id: string; question: string; options: { id: string; label: string }[]; endsAt: number };
export type MyPollVote = { id: string; pickLabel: string; partyName: string; choice: 'hit' | 'chalk'; status: 'pending' | 'cashed' | 'chalked'; decidedAt?: number };
export type PartyPick = {
  id: string;
  game: string;
  line: string;
  score: string;
  clock: string;
  minsLeft: number;
  takers: string[];
  isClutch: boolean;
  startAtMs: number;
};
export type PickOfDay = { id: string; league: string; player: string; prop: string; line: number; game: string; resolved?: boolean; correct?: "over" | "under" } | null;
export type ChatMessage = { id: string; user: string; text: string; ts: number };

const USERS = ['Alex','Jordan','Sam','Taylor','Riley','Casey','Devin','Kai'] as const;
const GAMES = ['SF @ DAL','KC @ BUF','PHI @ NYG','MIA @ NE','LAL @ DEN','BOS @ MIA','GSW @ PHX','NYK @ MIL'];

const initialScores: Record<string, number> = Object.fromEntries(USERS.map(u => [u, Math.floor(Math.random()*40)]));

interface StoreState {
  // Authentication state
  isAuthenticated: boolean;
  authToken: string | null;
  user: {
    id: number;
    email: string;
    username: string;
    fullName: string;
    walletBalance: number;
    profilePictureUrl: string | null;
  } | null;
  authLoading: boolean;
  authError: string | null;
  
  // Existing state
  me: string;
  myParties: Party[];
  selectedPartyId: string | null;
  currentParty: Party | null;
  partyScores: Record<string, Record<string, number>>;
  partyPrizePools: Record<string, number>;
  partyPicks: Record<string, PartyPick[]>;
  partyBuyIns: Record<string, number>;
  partyAllowedSports: Record<string, string[]>;
  evalSettings: Record<string, { limit: number; selected: string[] }>;
  wallet: number;
  events: ActionEvent[];
  clutch: ActionEvent | null;
  clutchStream: ActionEvent[];
  poll: Poll | null;
  resolvedOptionId: string | null;
  myPolls: MyPollVote[];
  pickOfDay: PickOfDay;
  podChoice: "over" | "under" | null;
  podStreak: number;
  myParlayOfDay: string | null;
  friendParlayOfDay: string | null;
  profilePhotoUrl: string | null;
  connections: Record<string, boolean>;
  now: number;
  
  // Actions
  createParty: (name: string, type: PartyType, startDate: string, endDate: string, buyIn?: number, allowedSports?: string[], evalLimit?: number) => void;
  joinParty: (code: string, buyIn?: number) => void;
  selectParty: (id: string) => void;
  submitVote: (opts: { id: string; label: string; partyName: string; choice: 'hit' | 'chalk'; isClutch?: boolean }) => void;
  votePoll: (optionId: string) => void;
  handlePodPick: (choice: "over" | "under") => void;
  setMyParlayOfDay: (pickId: string | null) => void;
  setFriendParlayOfDay: (pickId: string | null) => void;
  addFunds: (amount: number) => void;
  withdrawFunds: (amount: number) => void;
  setProfilePhotoUrl: (url: string | null) => void;
  setConnections: (connections: Record<string, boolean>) => void;
  addChatMessage: (partyId: string, message: ChatMessage) => void;
  getChatMessages: (partyId: string) => ChatMessage[];
}

const StoreCtx = createContext<StoreState | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myParties, setMyParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [partyScores, setPartyScores] = useState<Record<string, Record<string, number>>>({});
  const [partyPrizePools, setPartyPrizePools] = useState<Record<string, number>>({});
  const [partyPicks, setPartyPicks] = useState<Record<string, PartyPick[]>>({});
  const [partyBuyIns, setPartyBuyIns] = useState<Record<string, number>>({});
  const [partyAllowedSports, setPartyAllowedSports] = useState<Record<string, string[]>>({});
  const [evalSettings, setEvalSettings] = useState<Record<string, { limit: number; selected: string[] }>>({});
  const [wallet, setWallet] = useState<number>(100);
  const [events, setEvents] = useState<ActionEvent[]>([]);
  const [clutch, setClutch] = useState<ActionEvent | null>(null);
  const [clutchStream, setClutchStream] = useState<ActionEvent[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [resolvedOptionId, setResolvedOptionId] = useState<string | null>(null);
  const [myPolls, setMyPolls] = useState<MyPollVote[]>([
    { id: "seed1", pickLabel: "3-leg parlay • SF @ DAL TT o23.5", partyName: "Sunday Sweats", choice: "hit", status: "cashed", decidedAt: Date.now() - 3600_000 },
    { id: "seed2", pickLabel: "2-leg parlay • KC @ BUF o/u 44.5", partyName: "Sunday Sweats", choice: "hit", status: "chalked", decidedAt: Date.now() - 7200_000 },
    { id: "seed3", pickLabel: "4-leg parlay • PHI @ NYG alt spread +3.5", partyName: "Competitive Party", choice: "chalk", status: "pending" },
  ]);
  const [pickOfDay, setPickOfDay] = useState<PickOfDay>(null);
  const [podChoice, setPodChoice] = useState<"over" | "under" | null>(null);
  const [podStreak, setPodStreak] = useState<number>(0);
  const [myParlayOfDay, setMyParlayOfDay] = useState<string | null>(null);
  const [friendParlayOfDay, setFriendParlayOfDay] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<number>(Date.now());
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    username: string;
    fullName: string;
    walletBalance: number;
    profilePictureUrl: string | null;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const me = USERS[0];
  const currentParty = useMemo(() => myParties.find(p => p.id === selectedPartyId) || null, [myParties, selectedPartyId]);

  // Load persisted data
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [walletData, profileData, connectionsData, podStreakData] = await Promise.all([
          mockStorage.getItem('wallet_balance'),
          mockStorage.getItem('profilePhotoUrl'),
          mockStorage.getItem('connections'),
          mockStorage.getItem('pod_streak_me'),
        ]);
        
        if (walletData) setWallet(Number(walletData) || 100);
        if (profileData) setProfilePhotoUrl(profileData);
        if (connectionsData) setConnections(JSON.parse(connectionsData));
        if (podStreakData) setPodStreak(Number(podStreakData) || 0);
      } catch (error) {
        console.error('Error loading persisted data:', error);
      }
    };
    
    loadPersistedData();
  }, []);

  // Persist data changes
  useEffect(() => {
    mockStorage.setItem('wallet_balance', String(wallet));
  }, [wallet]);
  
  useEffect(() => {
    if (profilePhotoUrl) {
      mockStorage.setItem('profilePhotoUrl', profilePhotoUrl);
    } else {
      mockStorage.removeItem('profilePhotoUrl');
    }
  }, [profilePhotoUrl]);
  
  useEffect(() => {
    mockStorage.setItem('connections', JSON.stringify(connections));
  }, [connections]);
  
  useEffect(() => {
    mockStorage.setItem('pod_streak_me', String(podStreak));
  }, [podStreak]);

  // Seed demo parties once
  useEffect(() => {
    if (myParties.length > 0) return;
    
    const friendly: Party = { id: "p_friendly", name: "Sunday Sweats", type: "friendly", startDate: "2024-01-01", endDate: "2024-01-31" };
    const comp: Party = { id: "p_comp", name: "Competitive Party", type: "competitive", startDate: "2024-02-01", endDate: "2024-02-28" };
    const seeded = [friendly, comp];
    setMyParties(seeded);
    
    // Initialize scores
    setPartyScores({ p_friendly: { ...initialScores }, p_comp: { ...initialScores } });
    
    // Seed picks per party
    const mkPick = (override?: Partial<PartyPick>): PartyPick => ({
      id: Math.random().toString(36).slice(2),
      game: ["SF @ DAL","KC @ BUF","PHI @ NYG","MIA @ NE"][Math.floor(Math.random()*4)],
      line: Math.random() > 0.5 ? `o/u ${(40 + Math.floor(Math.random()*12)+0.5).toFixed(1)}` : `TT o${(20 + Math.floor(Math.random()*12)+0.5).toFixed(1)}`,
      score: `${20+Math.floor(Math.random()*15)}-${17+Math.floor(Math.random()*15)}`,
      clock: `Q${3+Math.floor(Math.random()*2)} ${String(Math.floor(Math.random()*7)).padStart(2,"0")}:${String(Math.floor(Math.random()*60)).padStart(2,"0")}`,
      minsLeft: 5 + Math.floor(Math.random()*20),
      takers: Array.from(new Set([USERS[Math.floor(Math.random()*USERS.length)], USERS[Math.floor(Math.random()*USERS.length)]])),
      isClutch: Math.random() > 0.7,
      startAtMs: Date.now() + (5 + Math.floor(Math.random()*86)) * 60_000,
      ...override,
    });
    
    setPartyPicks({
      p_friendly: (() => {
        const nowMs = Date.now();
        const arr: PartyPick[] = [];
        arr.push(
          mkPick({ takers: [USERS[0], USERS[2]], startAtMs: nowMs + 25 * 60_000, isClutch: false }),
          mkPick({ takers: [USERS[0]], startAtMs: nowMs + 45 * 60_000, isClutch: false }),
          mkPick({ takers: [USERS[1]], startAtMs: nowMs + 15 * 60_000 }),
          mkPick({ takers: [USERS[3], USERS[6]], startAtMs: nowMs + 55 * 60_000 }),
          mkPick({ takers: [USERS[4], USERS[5]], startAtMs: nowMs - 30 * 60_000, isClutch: true, minsLeft: 3 }),
          mkPick({ takers: [USERS[2]], startAtMs: nowMs - 10 * 60_000 }),
          mkPick({ takers: [USERS[7], USERS[0]], startAtMs: nowMs - 5 * 60_000, isClutch: Math.random() > 0.6 }),
        );
        return arr;
      })(),
      p_comp: (() => {
        const nowMs = Date.now();
        const arr: PartyPick[] = [];
        arr.push(
          mkPick({ takers: [USERS[3]], startAtMs: nowMs - 35 * 60_000, isClutch: true, minsLeft: 1 }),
          mkPick({ takers: [USERS[1], USERS[4]], startAtMs: nowMs - 20 * 60_000 }),
          mkPick({ takers: [USERS[0]], startAtMs: nowMs + 20 * 60_000 }),
          mkPick({ takers: [USERS[7]], startAtMs: nowMs + 60 * 60_000 }),
          mkPick({ takers: [USERS[2], USERS[5]], startAtMs: nowMs - 8 * 60_000 }),
          mkPick({ takers: [USERS[6]], startAtMs: nowMs + 10 * 60_000 }),
          mkPick({ takers: [USERS[4]], startAtMs: nowMs + 40 * 60_000 }),
        );
        return arr;
      })(),
    });
    
    setSelectedPartyId("p_friendly");
  }, [myParties.length]);

  // Update clock
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulate the Attention Engine producing events
  useEffect(() => {
    if (!currentParty) return;
    const id = setInterval(() => {
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      const game = GAMES[Math.floor(Math.random() * GAMES.length)];
      const isClutch = Math.random() > 0.78;
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
  }, [currentParty, clutch]);

  // Auto-generate Prophet Polls tied to clutch moments
  useEffect(() => {
    if (!clutch) return;
    const endsAt = Date.now() + 10000;
    setPoll({
      id: clutch.id,
      question: `Will ${clutch.user}'s clutch parlay hit in ${clutch.game}?`,
      options: [
        { id: "yes_hit", label: "Yes, it hits" },
        { id: "no_miss", label: "No, it misses" },
      ],
      endsAt,
    });
    setResolvedOptionId(null);
  }, [clutch]);

  // Resolve poll at end time
  useEffect(() => {
    if (!poll) return;
    const t = setInterval(() => {
      if (Date.now() >= poll.endsAt && !resolvedOptionId) {
        const correct = Math.random() > 0.5 ? "yes_hit" : "no_miss";
        setResolvedOptionId(correct);
        setTimeout(() => setClutch(null), 1200);
      }
    }, 250);
    return () => clearInterval(t);
  }, [poll, resolvedOptionId]);

  // Generate Pick of the Day
  useEffect(() => {
    if (!currentParty) { setPickOfDay(null); setPodChoice(null); return; }
    const todayKey = new Date().toISOString().slice(0,10);
    const storageKey = `pod_${currentParty.id}_${todayKey}`;
    
    mockStorage.getItem(storageKey).then(saved => {
      if (saved) { 
        setPickOfDay(JSON.parse(saved)); 
        setPodChoice(null); 
        return; 
      }
      
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
      mockStorage.setItem(storageKey, JSON.stringify(pod));
    });
  }, [currentParty, partyAllowedSports]);

  const createParty = useCallback((name: string, type: PartyType, startDate: string, endDate: string, buyIn?: number, allowedSports?: string[], evalLimit?: number) => {
    const id = Math.random().toString(36).slice(2);
    const defaultName = type === "friendly" ? "Friendly Party" : "Competitive Party";
    const p: Party = { id, name: name.trim() || defaultName, type, startDate, endDate };
    
    setMyParties((arr) => [p, ...arr]);
    setPartyScores((m) => ({ ...m, [id]: { ...initialScores } }));
    
    if (type === "competitive" && buyIn) {
      setWallet((w) => w - buyIn);
      setPartyPrizePools((m) => ({ ...m, [id]: buyIn }));
      setEvalSettings((m) => ({ ...m, [id]: { limit: Math.max(1, Math.min(1000, evalLimit || 5)), selected: [] } }));
      setPartyBuyIns((m) => ({ ...m, [id]: buyIn }));
      setPartyAllowedSports((m) => ({ ...m, [id]: [...(allowedSports || ["NFL", "NBA"])] }));
    }
    
    setSelectedPartyId(id);
  }, []);

  const joinParty = useCallback((code: string, buyIn?: number) => {
    const prefix = code.trim()[0]?.toUpperCase();
    const t: PartyType = prefix === "C" ? "competitive" : "friendly";
    
    if (t === "competitive" && buyIn) {
      setWallet((w) => w - buyIn);
    }
    
    const id = Math.random().toString(36).slice(2);
    const nameSuffix = code.slice(-4).toUpperCase();
    const today = new Date();
    const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const p: Party = { id, name: `Invite Party ${nameSuffix}`, type: t, startDate: today.toISOString().slice(0,10), endDate: in7.toISOString().slice(0,10) };
    
    setMyParties((arr) => [p, ...arr]);
    setPartyScores((m) => ({ ...m, [id]: { ...initialScores } }));
    
    if (t === "competitive" && buyIn) {
      setPartyPrizePools((m) => ({ ...m, [id]: buyIn }));
      setPartyBuyIns((m) => ({ ...m, [id]: buyIn }));
      setPartyAllowedSports((m) => ({ ...m, [id]: ["NFL", "NBA"] }));
    }
    
    setSelectedPartyId(id);
  }, []);

  const selectParty = useCallback((id: string) => {
    setSelectedPartyId(id);
    setEvents([]);
    setClutch(null);
    setPoll(null);
    setResolvedOptionId(null);
  }, []);

  const submitVote = useCallback((opts: { id: string; label: string; partyName: string; choice: 'hit' | 'chalk'; isClutch?: boolean }) => {
    const { id, label, partyName, choice, isClutch } = opts;
    const uniqueId = `${id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setMyPolls((arr)=>[{ id: uniqueId, pickLabel: label, partyName, choice, status: "pending" }, ...arr]);
    
    setTimeout(() => {
      const correct = Math.random() > 0.5 ? "hit" : "chalk";
      const gained = (choice === correct) ? (isClutch ? 15 : 10) : (isClutch ? -8 : -5);
      if (currentParty) {
        setPartyScores((m) => ({ 
          ...m, 
          [currentParty.id]: { 
            ...(m[currentParty.id] || {}), 
            [me]: ((m[currentParty.id]?.[me] || 0) + gained) 
          } 
        }));
      }
      setMyPolls((arr) => arr.map(mp => mp.id === uniqueId ? { ...mp, status: correct === "hit" ? "cashed" : "chalked", decidedAt: Date.now() } : mp));
    }, 2500);
  }, [me, currentParty]);

  const votePoll = useCallback((optionId: string) => {
    if (!poll) return;
    const choice: 'hit' | 'chalk' = optionId === 'yes_hit' ? 'hit' : 'chalk';
    const partyName = currentParty ? currentParty.name : "All Parties";
    const label = `Prophet Poll • ${clutch?.game ?? "Live"}`;
    submitVote({ id: poll.id, label, partyName, choice, isClutch: true });
  }, [poll, currentParty, clutch, submitVote]);

  const handlePodPick = useCallback((choice: "over" | "under") => {
    if (!pickOfDay || !currentParty) return;
    setPodChoice(choice);
    
    setTimeout(() => {
      const correct: "over" | "under" = Math.random() > 0.5 ? "over" : "under";
      setPickOfDay((p) => p ? { ...p, resolved: true, correct } : p);
      const won = correct === choice;
      if (currentParty) {
        setPartyScores((m) => ({ 
          ...m, 
          [currentParty.id]: { 
            ...(m[currentParty.id] || {}), 
            [me]: ((m[currentParty.id]?.[me] || 0) + (won ? 12 : 0)) 
          } 
        }));
      }
      setPodStreak((st) => won ? st + 1 : 0);
    }, 1200);
  }, [pickOfDay, currentParty, me]);

  const addFunds = useCallback((amount: number) => {
    setWallet((w) => w + amount);
  }, []);

  const withdrawFunds = useCallback((amount: number) => {
    setWallet((w) => Math.max(0, w - amount));
  }, []);

  const addChatMessage = useCallback((partyId: string, message: ChatMessage) => {
    const storageKey = `party_chat_${partyId}`;
    mockStorage.getItem(storageKey).then(raw => {
      const messages = raw ? JSON.parse(raw) : [];
      const updated = [...messages, message];
      mockStorage.setItem(storageKey, JSON.stringify(updated));
    });
  }, []);

  const getChatMessages = useCallback(async (partyId: string): Promise<ChatMessage[]> => {
    const storageKey = `party_chat_${partyId}`;
    try {
      const raw = await mockStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // Authentication methods
  const register = useCallback(async (userData: {
    email: string;
    username: string;
    fullName: string;
    password: string;
  }) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const response = await authAPI.register(userData);
      setAuthToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setWallet(response.user.walletBalance);
      return response;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: {
    email: string;
    password: string;
  }) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const response = await authAPI.login(credentials);
      setAuthToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setWallet(response.user.walletBalance);
      return response;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    setWallet(100); // Reset to default
  }, []);

  const updateProfile = useCallback(async (updates: {
    fullName?: string;
    profilePictureUrl?: string;
    walletBalance?: number;
  }) => {
    if (!authToken) throw new Error('Not authenticated');
    
    try {
      const response = await authAPI.updateProfile(authToken, updates);
      setUser(response.user);
      if (updates.walletBalance !== undefined) {
        setWallet(updates.walletBalance);
      }
      return response;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Profile update failed');
      throw error;
    }
  }, [authToken]);

  const addWalletFunds = useCallback(async (amount: number) => {
    if (!authToken) throw new Error('Not authenticated');
    
    try {
      const response = await authAPI.addWalletFunds(authToken, amount);
      setWallet(response.newBalance);
      if (user) {
        setUser({ ...user, walletBalance: response.newBalance });
      }
      return response;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to add funds');
      throw error;
    }
  }, [authToken, user]);

  const value: StoreState = useMemo(() => ({
    // Authentication state
    isAuthenticated,
    authToken,
    user,
    authLoading,
    authError,
    
    // Existing state
    me,
    myParties,
    selectedPartyId,
    currentParty,
    partyScores,
    partyPrizePools,
    partyPicks,
    partyBuyIns,
    partyAllowedSports,
    evalSettings,
    wallet,
    events,
    clutch,
    clutchStream,
    poll,
    resolvedOptionId,
    myPolls,
    pickOfDay,
    podChoice,
    podStreak,
    myParlayOfDay,
    friendParlayOfDay,
    profilePhotoUrl,
    connections,
    now,
    
    // Existing methods
    createParty,
    joinParty,
    selectParty,
    submitVote,
    votePoll,
    handlePodPick,
    setMyParlayOfDay,
    setFriendParlayOfDay,
    addFunds,
    withdrawFunds,
    setProfilePhotoUrl,
    setConnections,
    addChatMessage,
    getChatMessages,
    
    // Authentication methods
    register,
    login,
    logout,
    updateProfile,
    addWalletFunds,
  }), [
    // Authentication dependencies
    isAuthenticated, authToken, user, authLoading, authError,
    // Existing dependencies
    me, myParties, selectedPartyId, currentParty, partyScores, partyPrizePools, partyPicks, 
    partyBuyIns, partyAllowedSports, evalSettings, wallet, events, clutch, clutchStream, 
    poll, resolvedOptionId, myPolls, pickOfDay, podChoice, podStreak, myParlayOfDay, 
    friendParlayOfDay, profilePhotoUrl, connections, now, createParty, joinParty, selectParty, 
    submitVote, votePoll, handlePodPick, addFunds, withdrawFunds, setProfilePhotoUrl, 
    setConnections, addChatMessage, getChatMessages,
    // Authentication method dependencies
    register, login, logout, updateProfile, addWalletFunds
  ]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};