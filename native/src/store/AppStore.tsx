import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabaseAPI } from '../services/supabaseAPI';
import { GameSimulationService, SimulationGame, GamePlay, GameFinal, PlayerStats } from '../services/gameSimulationService';

// Simple in-memory storage for development
const mockStorage = {
  data: {} as Record<string, string>,
  getItem: (key: string) => Promise.resolve(mockStorage.data[key] || null),
  setItem: (key: string, value: string) => Promise.resolve(mockStorage.data[key] = value),
  removeItem: (key: string) => Promise.resolve(delete mockStorage.data[key]),
};

type PartyType = 'friendly' | 'competitive';
export type Party = { 
  id: string; 
  name: string; 
  type: PartyType; 
  startDate: string; 
  endDate: string;
  joinCode?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  members?: any[];
};
export type ActionEvent = { id: string; game: string; user: string; priority: number; isClutch: boolean; text: string };
export type Poll = { id: string; question: string; options: { id: string; label: string }[]; endsAt: number };
export type MyPollVote = {
  id: string;
  pickLabel: string;
  partyName: string;
  // user's prediction during Prophet Poll
  choice: 'hit' | 'miss';
  // final status after game ends
  status: 'pending' | 'CASH' | 'CHALK';
  decidedAt?: number;
  // metadata to resolve at game end
  playerSide?: 'A' | 'B';
  playerName?: string;
  overUnder?: 'Over' | 'Under';
  line?: number;
  type?: string;
};
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

// Game Simulation Types
export type SimulationState = {
  isRunning: boolean;
  currentGame: SimulationGame | null;
  currentPlay: GamePlay | null;
  playIndex: number;
  simulationError: string | null;
  playerAStats: PlayerStats | null;
  playerBStats: PlayerStats | null;
};

const USERS = ['Alex','Jordan','Sam','Taylor','Riley','Casey','Devin','Kai'] as const;
const GAMES = ['SF @ DAL','KC @ BUF','PHI @ NYG','MIA @ NE','LAL @ DEN','BOS @ MIA','GSW @ PHX','NYK @ MIL'];

const initialScores: Record<string, number> = Object.fromEntries(USERS.map(u => [u, Math.floor(Math.random()*40)]));

interface StoreState {
  // Authentication state
  isAuthenticated: boolean;
  authToken: string | null;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    walletBalance: number;
    profilePictureUrl: string | null;
  } | null;
  authLoading: boolean;
  authError: string | null;
  
  // Party API state
  partyLoading: boolean;
  partyError: string | null;
  
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
  
  // Game Simulation state
  simulation: SimulationState;
  
  // Actions
  createParty: (name: string, type: PartyType, startDate: string, endDate: string, buyIn?: number, allowedSports?: string[], evalLimit?: number) => Promise<{ joinCode: string; partyId: string } | null>;
  joinParty: (code: string, buyIn?: number) => Promise<void>;
  deleteParty: (partyId: string) => Promise<void>;
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
  getChatMessages: (partyId: string) => Promise<ChatMessage[]>;
  
  // Game Simulation actions
  startGameSimulation: () => Promise<void>;
  stopGameSimulation: () => void;
  clearSimulationData: () => void;
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
  // Start with no polls per spec
  const [myPolls, setMyPolls] = useState<MyPollVote[]>([]);
  // Track which clutch props have been triggered to avoid duplicates
  const [clutchTriggered, setClutchTriggered] = useState<{ A: boolean; B: boolean }>({ A: false, B: false });
  // One-time guards to avoid duplicate clutch triggers per prop per simulation run
  const clutchFiredRef = React.useRef<{ A: boolean; B: boolean }>({ A: false, B: false });
  const [pickOfDay, setPickOfDay] = useState<PickOfDay>(null);
  const [podChoice, setPodChoice] = useState<"over" | "under" | null>(null);
  const [podStreak, setPodStreak] = useState<number>(0);
  const [myParlayOfDay, setMyParlayOfDay] = useState<string | null>(null);
  const [friendParlayOfDay, setFriendParlayOfDay] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<number>(Date.now());
  
  // Game Simulation state
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentGame: null,
    currentPlay: null,
    playIndex: 0,
    simulationError: null,
    playerAStats: null,
    playerBStats: null
  });
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    username: string;
    fullName: string;
    walletBalance: number;
    profilePictureUrl: string | null;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Party API state
  const [partyLoading, setPartyLoading] = useState<boolean>(false);
  const [partyError, setPartyError] = useState<string | null>(null);
  
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


  // Update clock
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load parties from Supabase when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPartiesFromSupabase();
    }
  }, [isAuthenticated, user]);

  const loadPartiesFromSupabase = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await supabaseAPI.getMyParties();
      if (response.success && response.data) {
        const apiParties = response.data.parties.map((apiParty: any) => ({
          id: apiParty.id,
          name: apiParty.name,
          type: apiParty.type,
          startDate: apiParty.startDate,
          endDate: apiParty.endDate,
          joinCode: apiParty.joinCode,
          maxParticipants: apiParty.maxParticipants,
          currentParticipants: apiParty.currentParticipants,
          members: apiParty.members || []
        }));
        setMyParties(apiParties);
      }
    } catch (error) {
      console.error('Failed to load parties from Supabase:', error);
    }
  }, [user]);

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

  const createParty = useCallback(async (name: string, type: PartyType, startDate: string, endDate: string, buyIn?: number, allowedSports?: string[], evalLimit?: number) => {
    setPartyLoading(true);
    setPartyError(null);
    
    try {
      const response = await supabaseAPI.createParty({
        name: name.trim() || (type === "friendly" ? "Friendly Party" : "Competitive Party"),
        type,
        startDate,
        endDate,
        buyIn,
        allowedSports: allowedSports || ['NFL', 'NBA'],
        description: '',
        isPrivate: false
      });
      
      if (response.success && response.data) {
        const { party, joinCode } = response.data;
        
        // Refresh parties from Supabase instead of manually adding
        await loadPartiesFromSupabase();
        setPartyScores((m) => ({ ...m, [party.id]: { ...initialScores } }));
        
        if (type === "competitive" && buyIn) {
          setWallet((w) => w - buyIn);
          setPartyPrizePools((m) => ({ ...m, [party.id]: buyIn }));
          setEvalSettings((m) => ({ ...m, [party.id]: { limit: Math.max(1, Math.min(1000, evalLimit || 5)), selected: [] } }));
          setPartyBuyIns((m) => ({ ...m, [party.id]: buyIn }));
          setPartyAllowedSports((m) => ({ ...m, [party.id]: [...(allowedSports || ["NFL", "NBA"])] }));
        }
        
        setSelectedPartyId(party.id);
        
        // Return the actual joinCode from the API
        return { joinCode, partyId: party.id };
      } else {
        throw new Error('Failed to create party');
      }
    } catch (error) {
      console.error('Create party error:', error);
      setPartyError(error instanceof Error ? error.message : 'Failed to create party');
      return null;
    } finally {
      setPartyLoading(false);
    }
  }, [user, loadPartiesFromSupabase]);

  const joinParty = useCallback(async (code: string, buyIn?: number) => {
    setPartyLoading(true);
    setPartyError(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await supabaseAPI.joinParty({
        joinCode: code.trim(),
        username: user.username,
        displayName: user.fullName || user.username,
        profilePhotoUrl: user.profilePictureUrl || undefined
      });
      
      if (response.success && response.data) {
        const { party } = response.data;
        
        // Refresh parties from Supabase instead of manually adding
        await loadPartiesFromSupabase();
        setPartyScores((m) => ({ ...m, [party.id]: { ...initialScores } }));
        
        if (party.type === "competitive" && party.buyIn) {
          setWallet((w) => w - (party.buyIn || 0));
          setPartyPrizePools((m) => ({ ...m, [party.id]: party.buyIn || 0 }));
          setPartyBuyIns((m) => ({ ...m, [party.id]: party.buyIn || 0 }));
          setPartyAllowedSports((m) => ({ ...m, [party.id]: party.allowedSports || ["NFL", "NBA"] }));
        }
        
        setSelectedPartyId(party.id);
      } else {
        throw new Error('Failed to join party');
      }
    } catch (error) {
      console.error('Join party error:', error);
      setPartyError(error instanceof Error ? error.message : 'Failed to join party');
    } finally {
      setPartyLoading(false);
    }
  }, [user, loadPartiesFromSupabase]);

  const deleteParty = useCallback(async (partyId: string) => {
    setPartyLoading(true);
    setPartyError(null);
    
    try {
      await supabaseAPI.deleteParty(partyId);
      
      // Refresh parties from Supabase
      await loadPartiesFromSupabase();
      
      // If the deleted party was selected, clear selection
      if (selectedPartyId === partyId) {
        setSelectedPartyId(null);
        setEvents([]);
        setClutch(null);
        setPoll(null);
        setResolvedOptionId(null);
      }
      
      // Clean up party-specific state
      setPartyScores((m) => {
        const newScores = { ...m };
        delete newScores[partyId];
        return newScores;
      });
      setPartyPrizePools((m) => {
        const newPools = { ...m };
        delete newPools[partyId];
        return newPools;
      });
      setPartyBuyIns((m) => {
        const newBuyIns = { ...m };
        delete newBuyIns[partyId];
        return newBuyIns;
      });
      setPartyAllowedSports((m) => {
        const newSports = { ...m };
        delete newSports[partyId];
        return newSports;
      });
      setEvalSettings((m) => {
        const newSettings = { ...m };
        delete newSettings[partyId];
        return newSettings;
      });
    } catch (error) {
      console.error('Delete party error:', error);
      setPartyError(error instanceof Error ? error.message : 'Failed to delete party');
    } finally {
      setPartyLoading(false);
    }
  }, [selectedPartyId, loadPartiesFromSupabase]);

  const selectParty = useCallback((id: string) => {
    setSelectedPartyId(id);
    setEvents([]);
    setClutch(null);
    setPoll(null);
    setResolvedOptionId(null);
  }, []);

  const submitVote = useCallback((opts: { id: string; label: string; partyName: string; choice: 'hit' | 'miss'; isClutch?: boolean; meta?: { playerSide: 'A'|'B'; playerName: string; overUnder: 'Over'|'Under'; line: number; type: string } }) => {
    const { id, label, partyName, choice, isClutch, meta } = opts;
    const uniqueId = `${id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setMyPolls((arr)=>[
      { id: uniqueId, pickLabel: label, partyName, choice, status: 'pending', playerSide: meta?.playerSide, playerName: meta?.playerName, overUnder: meta?.overUnder, line: meta?.line, type: meta?.type },
      ...arr
    ]);
    // Do not resolve immediately; resolve at game end per spec
  }, [me, currentParty]);

  const votePoll = useCallback((optionId: string) => {
    if (!poll) return;
    const choice: 'hit' | 'miss' = optionId === 'yes_hit' ? 'hit' : 'miss';
    const partyName = currentParty ? currentParty.name : "All Parties";
    // Build label from poll.question
    const label = poll.question;
    // Attach meta from last clutch trigger stored in poll.id mapping via closure on clutch
    let meta: { playerSide: 'A'|'B'; playerName: string; overUnder: 'Over'|'Under'; line: number; type: string } | undefined;
    if (simulation.currentGame) {
      const a = simulation.currentGame.playerA;
      const b = simulation.currentGame.playerB;
      if (poll.id.endsWith('_A')) meta = { playerSide: 'A', playerName: a.player, overUnder: a.overUnder, line: a.line, type: a.type };
      if (poll.id.endsWith('_B')) meta = { playerSide: 'B', playerName: b.player, overUnder: b.overUnder, line: b.line, type: b.type };
    }
    submitVote({ id: poll.id, label, partyName, choice, isClutch: true, meta });
  }, [poll, currentParty, simulation.currentGame, submitVote]);

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
      const response = await supabaseAPI.signUp(userData.email, userData.password, {
        username: userData.username,
        fullName: userData.fullName,
      });
      
      if (response.user) {
        const userProfile = await supabaseAPI.getUserProfile(response.user.id);
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          username: userProfile.username,
          fullName: userProfile.full_name,
          walletBalance: userProfile.wallet_balance,
          profilePictureUrl: userProfile.profile_picture_url,
        });
        setIsAuthenticated(true);
        setWallet(userProfile.wallet_balance);
      }
      
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
      const response = await supabaseAPI.signIn(credentials.email, credentials.password);
      
      if (response.user) {
        const userProfile = await supabaseAPI.getUserProfile(response.user.id);
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          username: userProfile.username,
          fullName: userProfile.full_name,
          walletBalance: userProfile.wallet_balance,
          profilePictureUrl: userProfile.profile_picture_url,
        });
        setIsAuthenticated(true);
        setWallet(userProfile.wallet_balance);
      }
      
      return response;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabaseAPI.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setWallet(100); // Reset to default
    }
  }, []);

  const updateProfile = useCallback(async (updates: {
    fullName?: string;
    profilePictureUrl?: string;
    walletBalance?: number;
  }) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const response = await supabaseAPI.updateUserProfile(user.id, {
        full_name: updates.fullName,
        profile_picture_url: updates.profilePictureUrl,
        wallet_balance: updates.walletBalance,
      });
      
      setUser({
        ...user,
        fullName: response.full_name,
        profilePictureUrl: response.profile_picture_url,
        walletBalance: response.wallet_balance,
      });
      
      if (updates.walletBalance !== undefined) {
        setWallet(updates.walletBalance);
      }
      
      return response;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Profile update failed');
      throw error;
    }
  }, [user]);

  const addWalletFunds = useCallback(async (amount: number) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const newBalance = user.walletBalance + amount;
      const response = await supabaseAPI.updateUserProfile(user.id, {
        wallet_balance: newBalance,
      });
      
      setWallet(newBalance);
      setUser({ ...user, walletBalance: newBalance });
      
      return { newBalance };
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to add funds');
      throw error;
    }
  }, [user]);

  // Game Simulation actions
  const startGameSimulation = useCallback(async () => {
    // Prevent multiple simultaneous simulations
    if (simulation.isRunning) {
      console.log('Simulation already running, ignoring request');
      return;
    }
    
    try {
      setSimulation(prev => ({ ...prev, simulationError: null }));
      
      // Clear existing dummy data
      clearSimulationData();
      
      // Use KC @ BUF from dummy data (KC = Chiefs, BUF = Bills)
      const teamA = { name: "Chiefs", abbreviation: "KC", city: "Kansas City" };
      const teamB = { name: "Bills", abbreviation: "BUF", city: "Buffalo" };
      
      // Generate new game simulation with these specific teams
      const simulationGame = await GameSimulationService.generateGameSimulationWithTeams(teamA, teamB);
      
      setSimulation(prev => ({
        ...prev,
        isRunning: true,
        currentGame: simulationGame,
        currentPlay: null,
        playIndex: 0
      }));
      
      // Start the simulation loop
      executeSimulationLoop(simulationGame);
      
    } catch (error) {
      setSimulation(prev => ({
        ...prev,
        simulationError: error instanceof Error ? error.message : 'Failed to start simulation'
      }));
    }
  }, [simulation.isRunning, clearSimulationData, executeSimulationLoop]);

  const stopGameSimulation = useCallback(() => {
    setSimulation(prev => ({
      ...prev,
      isRunning: false,
      currentPlay: null,
      playIndex: 0,
      currentGame: null
    }));
  }, []);

  const clearSimulationData = useCallback(() => {
    // Clear action channel events
    setEvents([]);
    setClutch(null);
    setPoll(null);
    setResolvedOptionId(null);
    setClutchTriggered({ A: false, B: false });
  }, []);

  const executeSimulationLoop = useCallback((simulationGame: SimulationGame) => {
    let playIndex = 0;
    const plays = simulationGame.gameScript;
    // reset guards
    clutchFiredRef.current = { A: false, B: false };
    
    // Initialize player stats
    const initialStats: PlayerStats = {
      passing_yards: 0,
      passing_tds: 0,
      rushing_yards: 0,
      rushing_tds: 0,
      receiving_yards: 0,
      receiving_tds: 0,
      receptions: 0
    };
    
    let playerAStats = { ...initialStats };
    let playerBStats = { ...initialStats };
    
    const playInterval = setInterval(() => {
      // Check if simulation was stopped
      setSimulation(prev => {
        if (!prev.isRunning) {
          clearInterval(playInterval);
          return prev;
        }
        return prev;
      });
      
      if (playIndex >= plays.length) {
        clearInterval(playInterval);
        handleSimulationEnd(simulationGame);
        return;
      }
      
      const currentPlay = plays[playIndex] as GamePlay;
      
      // Update stats if players are involved
      if (currentPlay.involved_players) {
        if (currentPlay.involved_players.includes(simulationGame.playerA.player)) {
          playerAStats = GameSimulationService.parsePlayStats(currentPlay.description, playerAStats);
        }
        if (currentPlay.involved_players.includes(simulationGame.playerB.player)) {
          playerBStats = GameSimulationService.parsePlayStats(currentPlay.description, playerBStats);
        }
      }
      
      // Update simulation state
      setSimulation(prev => ({
        ...prev,
        currentPlay,
        playIndex,
        playerAStats,
        playerBStats
      }));
      
      // UI updates are handled in BoardScreen component via useEffect
      
      // Check if this play involves our key players
      if (currentPlay.involved_players && 
          (currentPlay.involved_players.includes(simulationGame.playerA.player) || 
           currentPlay.involved_players.includes(simulationGame.playerB.player))) {
        // Determine if this should be marked as clutch in the action channel
        const isQ4ForAction = currentPlay.quarter === 4;
        let isClutchForAction = false;
        if (isQ4ForAction) {
          // During Q4 testing, mark as clutch if involves either prop player
          isClutchForAction = true;
        }
        const actionEvent: ActionEvent = {
          id: `sim_${playIndex}`,
          game: `${simulationGame.teamA.abbreviation} @ ${simulationGame.teamB.abbreviation}`,
          user: 'AI Simulation',
          priority: isClutchForAction ? 9 : 8,
          isClutch: isClutchForAction,
          text: currentPlay.description
        };
        console.log('[ClutchDebug] Action event', { playIndex, quarter: currentPlay.quarter, isClutchForAction, desc: currentPlay.description });
        setEvents(prev => [actionEvent, ...prev.slice(0, 29)]);
      }

      // Clutch Time detection (Q4 - TESTING: ALL props trigger in Q4)
      const isQ4 = currentPlay.quarter === 4;
      if (isQ4) {
        const aLine = simulationGame.playerA.line;
        const bLine = simulationGame.playerB.line;
        const aType = simulationGame.playerA.type as keyof PlayerStats;
        const bType = simulationGame.playerB.type as keyof PlayerStats;
        const aVal = playerAStats[aType] as unknown as number;
        const bVal = playerBStats[bType] as unknown as number;
        // TESTING: Remove threshold check - trigger for ALL props in Q4
        const aThreshold = 0; // Changed from 0.8 * aLine
        const bThreshold = 0; // Changed from 0.8 * bLine

        // Trigger A (now triggers for ANY stat value in Q4)
        console.log('[ClutchDebug] Q4 detected', { playIndex, aVal, aThreshold, bVal, bThreshold, aType, bType, aLine, bLine });
        if (!clutchFiredRef.current.A && aVal >= aThreshold) {
          clutchFiredRef.current.A = true;
          setClutchTriggered((s) => ({ ...s, A: true }));
          // Set clutch banner and create Prophet Poll for A
          const clutchIdA = `${simulationGame.id}-${simulationGame.playerA.player}-${simulationGame.playerA.prop}`;
          const clutchEventA: ActionEvent = {
            id: clutchIdA,
            game: `${simulationGame.teamA.abbreviation} @ ${simulationGame.teamB.abbreviation}`,
            user: simulationGame.playerA.player,
            priority: 10,
            isClutch: true,
            text: `${simulationGame.playerA.player} • ${simulationGame.playerA.overUnder} ${simulationGame.playerA.line} ${simulationGame.playerA.prop}`
          };
          console.log('[ClutchDebug] Trigger A', clutchEventA);
          setClutch(clutchEventA);
          setClutchStream(prev => {
            if (prev.some(e => e.id === clutchIdA)) return prev;
            return [clutchEventA, ...prev].slice(0, 20);
          });
          const endsAt = Date.now() + 15000;
          setPoll({
            id: `poll_${clutchIdA}`,
            question: `Will ${simulationGame.playerA.player} ${simulationGame.playerA.overUnder === 'Over' ? 'hit' : 'stay under'} ${simulationGame.playerA.line} ${simulationGame.playerA.prop.toLowerCase()}?`,
            options: [
              { id: 'yes_hit', label: 'Yes, it hits' },
              { id: 'no_miss', label: 'No, it misses' },
            ],
            endsAt
          });
          setResolvedOptionId(null);
        }

        // Trigger B (now triggers for ANY stat value in Q4)
        if (!clutchFiredRef.current.B && bVal >= bThreshold) {
          clutchFiredRef.current.B = true;
          setClutchTriggered((s) => ({ ...s, B: true }));
          const clutchIdB = `${simulationGame.id}-${simulationGame.playerB.player}-${simulationGame.playerB.prop}`;
          const clutchEventB: ActionEvent = {
            id: clutchIdB,
            game: `${simulationGame.teamA.abbreviation} @ ${simulationGame.teamB.abbreviation}`,
            user: simulationGame.playerB.player,
            priority: 10,
            isClutch: true,
            text: `${simulationGame.playerB.player} • ${simulationGame.playerB.overUnder} ${simulationGame.playerB.line} ${simulationGame.playerB.prop}`
          };
          console.log('[ClutchDebug] Trigger B', clutchEventB);
          setClutch(clutchEventB);
          setClutchStream(prev => {
            if (prev.some(e => e.id === clutchIdB)) return prev;
            return [clutchEventB, ...prev].slice(0, 20);
          });
          const endsAt = Date.now() + 15000;
          setPoll({
            id: `poll_${clutchIdB}`,
            question: `Will ${simulationGame.playerB.player} ${simulationGame.playerB.overUnder === 'Over' ? 'hit' : 'stay under'} ${simulationGame.playerB.line} ${simulationGame.playerB.prop.toLowerCase()}?`,
            options: [
              { id: 'yes_hit', label: 'Yes, it hits' },
              { id: 'no_miss', label: 'No, it misses' },
            ],
            endsAt
          });
          setResolvedOptionId(null);
        }
      }
      
      playIndex++;
    }, 800); // Faster tick: 0.8s per play
  }, [handleSimulationEnd]);

  const handleSimulationEnd = useCallback((simulationGame: SimulationGame) => {
    const finalPlay = simulationGame.gameScript[simulationGame.gameScript.length - 1] as GameFinal;
    
    // Update simulation state and determine outcomes
    setSimulation(prev => {
      if (!prev.playerAStats || !prev.playerBStats) {
        // Fallback if stats are not available
        const finalEvent: ActionEvent = {
          id: 'sim_final',
          game: `${simulationGame.teamA.abbreviation} @ ${simulationGame.teamB.abbreviation}`,
          user: 'AI Simulation',
          priority: 10,
          isClutch: true,
          text: `Game Over! Final Score: ${finalPlay?.final_score?.[simulationGame.teamA.abbreviation] || '0'} - ${finalPlay?.final_score?.[simulationGame.teamB.abbreviation] || '0'}`
        };
        setEvents(prevEvents => [finalEvent, ...prevEvents.slice(0, 29)]);
        
        return {
          ...prev,
          isRunning: false,
          currentPlay: null
        };
      }
      
      // Determine prop outcomes using actual stats
      const playerAOutcome = GameSimulationService.determinePropOutcome(simulationGame.playerA, prev.playerAStats);
      const playerBOutcome = GameSimulationService.determinePropOutcome(simulationGame.playerB, prev.playerBStats);

      // Resolve My Polls per rules and apply points
      setMyPolls((arr) => {
        console.log('[PollResolution] Starting resolution with', arr.length, 'polls');
        const updatedPolls = arr.map(mp => {
          if (!mp.playerSide) {
            console.log('[PollResolution] Skipping poll without playerSide:', mp.id);
            return mp;
          }
          const outcome = mp.playerSide === 'A' ? playerAOutcome : playerBOutcome; // 'hit' | 'miss'
          console.log('[PollResolution] Resolving poll:', { 
            id: mp.id, 
            playerSide: mp.playerSide, 
            userChoice: mp.choice, 
            actualOutcome: outcome,
            playerAOutcome,
            playerBOutcome
          });
          
          // Status mapping: user's prediction matches actual outcome → CASH, else CHALK
          const status = (mp.choice === 'hit' && outcome === 'hit') || (mp.choice === 'miss' && outcome === 'miss') ? 'CASH' : 'CHALK';
          console.log('[PollResolution] Final status:', status);
          
          return { ...mp, status, decidedAt: Date.now() };
        });
        
        // Apply points: correct => -10, incorrect => +10
        console.log('[PollResolution] Checking currentParty:', { currentParty: currentParty?.id, user: user?.id, me });
        if (currentParty && user) {
          const delta = (mp: MyPollVote) => {
            const outcome = mp.playerSide === 'A' ? playerAOutcome : playerBOutcome;
            const correct = (mp.choice === 'hit' && outcome === 'hit') || (mp.choice === 'miss' && outcome === 'miss');
            const points = correct ? -10 : 10;
            console.log('[PollResolution] Points for poll', mp.id, ':', points, '(correct:', correct, ')');
            return points;
          };
          const totalPointsChange = updatedPolls.reduce((acc, p) => acc + delta(p), 0);
          console.log('[PollResolution] Applying points:', { totalPointsChange, polls: updatedPolls.length, currentParty: currentParty.id, me });
          setPartyScores((m) => ({
            ...m,
            [currentParty.id]: {
              ...(m[currentParty.id] || {}),
              [me]: (m[currentParty.id]?.[me] || 0) + totalPointsChange
            }
          }));
          // Persist score to DB
          supabaseAPI.adjustPartyMemberScore(currentParty.id, user.id, totalPointsChange).then((res)=>{
            console.log('[PollResolution] DB score update result:', res);
          }).catch((e)=>{
            console.warn('[PollResolution] DB score update failed:', e);
          });
        } else {
          console.log('[PollResolution] Skipping points - no currentParty or user:', { currentParty: !!currentParty, user: !!user });
        }
        
        return updatedPolls;
      });
      
      // Show final results
      const finalEvent: ActionEvent = {
        id: 'sim_final',
        game: `${simulationGame.teamA.abbreviation} @ ${simulationGame.teamB.abbreviation}`,
        user: 'AI Simulation',
        priority: 10,
        isClutch: true,
        text: `Game Over! Final Score: ${finalPlay?.final_score?.[simulationGame.teamA.abbreviation] || '0'} - ${finalPlay?.final_score?.[simulationGame.teamB.abbreviation] || '0'}. ${simulationGame.playerA.player}: ${playerAOutcome === 'hit' ? 'CASH!' : 'CHALK!'}, ${simulationGame.playerB.player}: ${playerBOutcome === 'hit' ? 'CASH!' : 'CHALK!'}`
      };
      
      setEvents(prevEvents => [finalEvent, ...prevEvents.slice(0, 29)]);
      
      // Clear clutch state at game end
      setClutch(null);
      setClutchStream([]);
      setClutchTriggered({ A: false, B: false });
      
      return {
        ...prev,
        isRunning: false,
        currentPlay: null
      };
    });
  }, []);

  const value: StoreState = useMemo(() => ({
    // Authentication state
    isAuthenticated,
    authToken,
    user,
    authLoading,
    authError,
    
    // Party API state
    partyLoading,
    partyError,
    
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
    
    // Game Simulation state
    simulation,
    
    // Existing methods
    createParty,
    joinParty,
    deleteParty,
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
    
    // Game Simulation methods
    startGameSimulation,
    stopGameSimulation,
    clearSimulationData,
  }), [
    // Authentication dependencies
    isAuthenticated, authToken, user, authLoading, authError,
    // Party API dependencies
    partyLoading, partyError,
    // Existing dependencies
    me, myParties, selectedPartyId, currentParty, partyScores, partyPrizePools, partyPicks, 
    partyBuyIns, partyAllowedSports, evalSettings, wallet, events, clutch, clutchStream, 
    poll, resolvedOptionId, myPolls, pickOfDay, podChoice, podStreak, myParlayOfDay, 
    friendParlayOfDay, profilePhotoUrl, connections, now, createParty, joinParty, deleteParty, selectParty, 
    submitVote, votePoll, handlePodPick, addFunds, withdrawFunds, setProfilePhotoUrl, 
    setConnections, addChatMessage, getChatMessages,
    // Authentication method dependencies
    register, login, logout, updateProfile, addWalletFunds,
    // Game Simulation dependencies
    simulation, startGameSimulation, stopGameSimulation, clearSimulationData
  ]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};