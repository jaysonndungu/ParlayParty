"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type Poll = {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  endsAt: number; // ms timestamp
};

export function ProphetPoll({ poll, onVote, resolvedOptionId }: {
  poll: Poll | null;
  onVote: (optionId: string) => void;
  resolvedOptionId?: string | null;
}) {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  if (!poll) return null;
  const remaining = Math.max(0, Math.round((poll.endsAt - now) / 1000));

  return (
    <Card className="trophy-edge border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-[color:var(--text-high)]">Prophet Poll</CardTitle>
        <Badge className="bg-[color:var(--warning)] text-black">{remaining}s</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[color:var(--text-mid)]">{poll.question}</p>
        <div className="grid grid-cols-2 gap-2">
          {poll.options.map((o) => (
            <Button
              key={o.id}
              className="bg-[color:var(--neutral-chip)] text-[color:var(--text-high)] hover:bg-[color:var(--pp-purple)] hover:text-black"
              onClick={() => onVote(o.id)}
              disabled={!!resolvedOptionId}
            >
              {o.label}
            </Button>
          ))}
        </div>
        {resolvedOptionId && (
          <div className="text-xs text-[color:var(--text-mid)]">Correct answer: <span className="text-[color:var(--mint)]">{poll.options.find(o=>o.id===resolvedOptionId)?.label}</span></div>
        )}
      </CardContent>
    </Card>
  );
}