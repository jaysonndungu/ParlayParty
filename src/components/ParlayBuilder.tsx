"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type ParlayLeg = { id: string; game: string; market: string; pick: string };

const MOCK_GAMES = {
  nfl: ["NYJ @ BUF", "KC @ LAC", "DAL @ PHI", "SF @ SEA"],
  nba: ["LAL @ DEN", "BOS @ MIA", "GSW @ PHX", "NYK @ MIL"],
};

const MOCK_MARKETS = ["Points", "Rebounds", "Assists", "Passing Yds", "Receiving Yds"];

export function ParlayBuilder({ onSubmit }: { onSubmit: (legs: ParlayLeg[]) => void }) {
  const [sport, setSport] = useState<"nfl"|"nba">("nfl");
  const [legs, setLegs] = useState<ParlayLeg[]>([]);
  const [game, setGame] = useState(MOCK_GAMES.nfl[0]);
  const [market, setMarket] = useState(MOCK_MARKETS[0]);
  const [pick, setPick] = useState("Over");

  const canAdd = legs.length < 5;

  const addLeg = () => {
    if (!canAdd) return;
    setLegs((l) => [
      ...l,
      { id: Math.random().toString(36).slice(2), game, market, pick },
    ]);
  };

  const reset = () => setLegs([]);

  const summary = useMemo(() => `${legs.length}-leg parlay`, [legs.length]);

  return (
    <Card className="trophy-edge border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
      <CardHeader>
        <CardTitle className="text-[color:var(--text-high)]">Build a Parlay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[color:var(--text-mid)]">Sport</Label>
            <Select value={sport} onValueChange={(v)=>setSport(v as any)}>
              <SelectTrigger className="bg-[color:var(--ink-950)]/60 border-[color:var(--steel-700)] text-[color:var(--text-high)]">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent className="bg-[color:var(--slate-900)] border-[color:var(--steel-700)] text-[color:var(--text-high)]">
                <SelectItem value="nfl">NFL</SelectItem>
                <SelectItem value="nba">NBA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[color:var(--text-mid)]">Game</Label>
            <Select value={game} onValueChange={setGame}>
              <SelectTrigger className="bg-[color:var(--ink-950)]/60 border-[color:var(--steel-700)] text-[color:var(--text-high)]">
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent className="bg-[color:var(--slate-900)] border-[color:var(--steel-700)] text-[color:var(--text-high)]">
                {(sport==="nfl"?MOCK_GAMES.nfl:MOCK_GAMES.nba).map((g)=> (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[color:var(--text-mid)]">Market</Label>
            <Select value={market} onValueChange={setMarket}>
              <SelectTrigger className="bg-[color:var(--ink-950)]/60 border-[color:var(--steel-700)] text-[color:var(--text-high)]">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent className="bg-[color:var(--slate-900)] border-[color:var(--steel-700)] text-[color:var(--text-high)]">
                {MOCK_MARKETS.map((m)=> (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={()=>setPick("Over")} variant={pick==="Over"?"default":"secondary"} className={pick==="Over"?"bg-[color:var(--pp-purple)] text-black":"bg-[color:var(--neutral-chip)] text-[color:var(--text-high)]"}>Over</Button>
          <Button onClick={()=>setPick("Under")} variant={pick==="Under"?"default":"secondary"} className={pick==="Under"?"bg-[color:var(--pp-purple)] text-black":"bg-[color:var(--neutral-chip)] text-[color:var(--text-high)]"}>Under</Button>
          <Button onClick={addLeg} disabled={!canAdd} className="ml-auto bg-[color:var(--pp-purple)] text-black">Add Leg</Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[color:var(--text-mid)]">{summary}</span>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-[color:var(--text-mid)] hover:text-[color:var(--text-high)]" onClick={reset}>Reset</Button>
              <Button disabled={legs.length<2} className="bg-[color:var(--gold)] text-black" onClick={()=>onSubmit(legs)}>Place Picks</Button>
            </div>
          </div>
          <div className="grid gap-2">
            {legs.map((l)=> (
              <div key={l.id} className="flex items-center justify-between rounded-md border border-[color:var(--steel-700)] bg-[color:var(--ink-950)]/60 px-3 py-2">
                <div className="text-sm text-[color:var(--text-high)]">{l.game} • {l.market} • <span className="text-[color:var(--pp-purple)]">{l.pick}</span></div>
                <Badge variant="secondary" className="bg-[color:var(--neutral-chip)] text-[color:var(--text-mid)]">Leg</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}