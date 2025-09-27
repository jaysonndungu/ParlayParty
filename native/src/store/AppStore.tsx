import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type PartyType = 'friendly' | 'prize' | 'competitive';
export type Party = { id: string; name: string; type: PartyType };
export type ActionEvent = { id: string; game: string; user: string; priority: number; isClutch: boolean; text: string };
export type Poll = { id: string; question: string; options: { id: string; label: string }[]; endsAt: number };
export type MyPollVote = { id: string; pickLabel: string; partyName: string; choice: 'hit' | 'chalk'; status: 'pending' | 'cashed' | 'chalked'; decidedAt?: number };
type PickOfDay = { id: string; league: string; player: string; prop: string; line: number; game: string; resolved?: boolean; correct?: 'over' | 'under' } | null;

const USERS = ['Alex','Jordan','Sam','Taylor','Riley','Casey','Devin','Kai'] as const;
const GAMES = ['SF @ DAL','KC @ BUF','PHI @ NYG','MIA @ NE','LAL @ DEN','BOS @ MIA','GSW @ PHX','NYK @ MIL'];

const initialScores: Record<string, number> = Object.fromEntries(USERS.map(u => [u, Math.floor(Math.random()*40)]));

interface StoreState {
  me: string;
  parties: Party[];
  selectedPartyId: string | null;
  scores: Record<string, number>;
  prizePool: number;
  events: ActionEvent[];
  clutch: ActionEvent | null;
  poll: Poll | null;
  resolvedOptionId: string | null;
  myPolls: MyPollVote[];
  // Pick of the Day
  pickOfDay: PickOfDay;
  podChoice: 'over' | 'under' | null;
  podStreak: number;
  createParty: (name: string, type: PartyType) => void;
  joinParty: (code: string) => void;
  selectParty: (id: string) => void;
  submitVote: (o: { id: string; label: string; partyName: string; choice: 'hit' | 'chalk'; isClutch?: boolean }) => void;
  votePoll: (optionId: string) => void;
  handlePodPick: (choice: 'over' | 'under') => void;
}

const StoreCtx = createContext<StoreState | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [prizePool, setPrizePool] = useState<number>(250);
  const [events, setEvents] = useState<ActionEvent[]>([]);
  const [clutch, setClutch] = useState<ActionEvent | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [resolvedOptionId, setResolvedOptionId] = useState<string | null>(null);
  const [myPolls, setMyPolls] = useState<MyPollVote[]>([]);
  // Pick of the Day state
  const [pickOfDay, setPickOfDay] = useState<PickOfDay>(null);
  const [podChoice, setPodChoice] = useState<'over' | 'under' | null>(null);
  const [podStreak, setPodStreak] = useState<number>(0);
  const me = USERS[0];

  // seed once
  useEffect(() => {
    if (parties.length) return;
    const seeded: Party[] = [
      { id: 'p_friendly', name: 'Sunday Sweats', type: 'friendly' },
      { id: 'p_prize', name: 'Prize Pool Party', type: 'prize' },
      { id: 'p_comp', name: 'Competitive Party', type: 'competitive' },
    ];
    setParties(seeded);
    setSelectedPartyId('p_friendly');
  }, [parties.length]);

  // Generate Pick of the Day when party changes
  useEffect(() => {
    if (!selectedPartyId) { setPickOfDay(null); setPodChoice(null); return; }
    const todayKey = new Date().toISOString().slice(0,10);
    const storageKey = `pod_${selectedPartyId}_${todayKey}`;
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (saved) { setPickOfDay(JSON.parse(saved)); setPodChoice(null); return; }
    } catch {}
    const leagues = ['NFL','NBA','MLB','NHL'] as const;
    const league = leagues[Math.floor(Math.random()*leagues.length)];
    const STARS: Record<string, string[]> = {
      NFL: ['Patrick Mahomes','Christian McCaffrey','Tyreek Hill','Josh Allen'],
      NBA: ['LeBron James','Nikola Jokic','Giannis Antetokounmpo','Luka Doncic'],
      MLB: ['Shohei Ohtani','Aaron Judge','Mookie Betts','Juan Soto'],
      NHL: ['Connor McDavid','Auston Matthews','Nathan MacKinnon','Sidney Crosby'],
    };
    const playerList = STARS[league] || STARS.NFL;
    const player = playerList[Math.floor(Math.random()*playerList.length)];
    const games = ['SF @ DAL','KC @ BUF','PHI @ NYG','MIA @ NE','LAL @ DEN','GSW @ PHX'];
    const game = games[Math.floor(Math.random()*games.length)];
    const prop = league === 'NBA' ? 'Points' : league === 'NFL' ? 'Passing Yds' : league === 'MLB' ? 'TB' : 'Shots';
    const line = league === 'NBA' ? 28 + Math.floor(Math.random()*12) : league === 'NFL' ? 265 + Math.floor(Math.random()*80) : 2 + Math.floor(Math.random()*4);
    const pod = { id: Math.random().toString(36).slice(2), league, player, prop, line, game } as NonNullable<PickOfDay>;
    setPickOfDay(pod);
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(pod)); } catch {}
  }, [selectedPartyId]);

  // attention engine mock
  useEffect(() => {
    const t = setInterval(() => {
      if (!selectedPartyId) return;
      const user = USERS[Math.floor(Math.random()*USERS.length)];
      const game = GAMES[Math.floor(Math.random()*GAMES.length)];
      const isClutch = Math.random() > 0.78;
      const ev: ActionEvent = { id: Math.random().toString(36).slice(2), user, game, isClutch, priority: isClutch ? 10 : 7, text: isClutch ? `${user}'s 3-leg parlay hinges on next play in ${game}!` : `${user} needs 2 more rebounds in ${game}` };
      setEvents(prev => [ev, ...prev].slice(0, 30));
      if (isClutch) setClutch(ev);
      // grow prize pool in non-friendly
      const pt = parties.find(p => p.id === selectedPartyId)?.type;
      if (pt && pt !== 'friendly') setPrizePool(p => Math.min(5000, Math.round(p + 5 + Math.random()*20)));
    }, 1600);
    return () => clearInterval(t);
  }, [selectedPartyId, parties]);

  // generate poll on clutch
  useEffect(() => {
    if (!clutch) return;
    const endsAt = Date.now() + 10000;
    setPoll({ id: clutch.id, question: `Will ${clutch.user}'s clutch parlay hit in ${clutch.game}?`, options: [{ id: 'yes_hit', label: 'Yes, it hits' }, { id: 'no_miss', label: 'No, it misses' }], endsAt });
    setResolvedOptionId(null);
  }, [clutch]);

  // resolve poll
  useEffect(() => {
    if (!poll) return;
    const t = setInterval(() => {
      if (Date.now() >= poll.endsAt && !resolvedOptionId) {
        const correct = Math.random() > 0.5 ? 'yes_hit' : 'no_miss';
        setResolvedOptionId(correct);
      }
    }, 250);
    return () => clearInterval(t);
  }, [poll, resolvedOptionId]);

  const handlePodPick = (choice: 'over' | 'under') => {
    if (!pickOfDay) return;
    setPodChoice(choice);
    setTimeout(() => {
      const correct: 'over' | 'under' = Math.random() > 0.5 ? 'over' : 'under';
      setPickOfDay(p => p ? { ...p, resolved: true, correct } : p);
      const won = correct === choice;
      setScores(s => ({ ...s, [me]: (s[me] || 0) + (won ? 12 : 0) }));
      setPodStreak(st => won ? st + 1 : 0);
    }, 1200);
  };

  const createParty = (name: string, type: PartyType) => {
    const id = Math.random().toString(36).slice(2);
    const p: Party = { id, name: name.trim() || (type === 'friendly' ? 'Friendly Party' : type === 'prize' ? 'Prize Pool Party' : 'Competitive Party'), type };
    setParties(arr => [p, ...arr]);
    setSelectedPartyId(id);
  };

  const joinParty = (code: string) => {
    const prefix = code.trim()[0]?.toUpperCase();
    const type: PartyType = prefix === 'P' ? 'prize' : prefix === 'C' ? 'competitive' : 'friendly';
    const id = Math.random().toString(36).slice(2);
    const p: Party = { id, name: `Invite Party ${code.slice(-4).toUpperCase()}`, type };
    setParties(arr => [p, ...arr]);
    setSelectedPartyId(id);
  };

  const selectParty = (id: string) => {
    setSelectedPartyId(id);
    setEvents([]);
    setClutch(null);
    setPoll(null);
    setResolvedOptionId(null);
    setPickOfDay(null);
    setPodChoice(null);
  };

  const submitVote: StoreState['submitVote'] = ({ id, label, partyName, choice, isClutch }) => {
    setMyPolls(arr => [{ id, pickLabel: label, partyName, choice, status: 'pending' }, ...arr]);
    setTimeout(() => {
      const correct = Math.random() > 0.5 ? 'hit' : 'chalk';
      const gained = (choice === correct) ? (isClutch ? 15 : 10) : (isClutch ? -8 : -5);
      setScores(s => ({ ...s, [me]: (s[me] || 0) + gained }));
      setMyPolls(arr => arr.map(mp => mp.id === id ? { ...mp, status: correct === 'hit' ? 'cashed' : 'chalked', decidedAt: Date.now() } : mp));
    }, 2500);
  };

  const votePoll = (optionId: string) => {
    if (!poll) return;
    const choice: 'hit' | 'chalk' = optionId === 'yes_hit' ? 'hit' : 'chalk';
    const partyName = parties.find(p => p.id === selectedPartyId)?.name || 'All Parties';
    const label = `Prophet Poll • ${clutch?.game ?? 'Live'}`;
    submitVote({ id: poll.id, label, partyName, choice, isClutch: true });
  };

  const value: StoreState = useMemo(() => ({
    me,
    parties,
    selectedPartyId,
    scores,
    prizePool,
    events,
    clutch,
    poll,
    resolvedOptionId,
    myPolls,
    pickOfDay,
    podChoice,
    podStreak,
    createParty,
    joinParty,
    selectParty,
    submitVote,
    votePoll,
    handlePodPick,
  }), [me, parties, selectedPartyId, scores, prizePool, events, clutch, poll, resolvedOptionId, myPolls, pickOfDay, podChoice, podStreak]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};