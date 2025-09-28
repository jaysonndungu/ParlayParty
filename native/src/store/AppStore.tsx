import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabaseAPI } from '../services/supabaseAPI';

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
  
  // Actions
  createParty: (name: string, type: PartyType, startDate: string, endDate: string, buyIn?: number, allowedSports?: string[], evalLimit?: number) => Promise<{ joinCode: string; partyId: string } | null>;
  joinParty: (code: string, buyIn?: number) => Promise<void>;
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
      const response = await supabaseAPI.signUp(userData.email, userData.password, {
        username: userData.username,
        fullName: userData.fullName,
      });
      
      if (response.user) {
        const userProfile = await supabaseAPI.getUserProfile(response.user.id);
        setUser({
          id: parseInt(userProfile.id),
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
          id: parseInt(userProfile.id),
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
      const response = await supabaseAPI.updateUserProfile(user.id.toString(), {
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
      const response = await supabaseAPI.updateUserProfile(user.id.toString(), {
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
    // Party API dependencies
    partyLoading, partyError,
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