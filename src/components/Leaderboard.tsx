"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export function Leaderboard({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const leader = entries[0]?.[0];
  return (
    <Card className="trophy-edge border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[color:var(--text-high)]">Leaderboard</CardTitle>
        <Badge className="bg-[color:var(--gold)] text-black flex items-center gap-1"><Trophy className="h-3 w-3"/>Top</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map(([name, pts], idx) => (
          <div key={name} className={`flex items-center justify-between rounded-md border px-3 py-2 ${name===leader?"border-[color:var(--gold)] bg-[color:var(--ink-950)]/60":"border-[color:var(--steel-700)]"}`}>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-6 w-6 rounded-full text-center text-xs leading-6 ${idx===0?"bg-[color:var(--gold)] text-black":"bg-[color:var(--neutral-chip)] text-[color:var(--text-high)]"}`}>{idx+1}</span>
              <span className="text-sm text-[color:var(--text-high)]">{name}</span>
            </div>
            <span className="text-xs text-[color:var(--text-mid)]">{pts} pts</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}