"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ActionEvent = {
  id: string;
  game: string;
  text: string;
  priority: number; // higher = more urgent
  user: string;
  isClutch?: boolean;
};

export function ActionChannel({
  events,
  onFocusClutch,
}: {
  events: ActionEvent[];
  onFocusClutch: (event: ActionEvent) => void;
}) {
  const top3 = [...events].sort((a, b) => b.priority - a.priority).slice(0, 6);

  return (
    <Card className="trophy-edge bg-[color:var(--slate-900)] border-[color:var(--steel-700)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[color:var(--text-high)]">Action Channel</CardTitle>
        <Badge className="bg-[color:var(--pp-purple)] text-black">Live</Badge>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {top3.map((e) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="flex items-start justify-between gap-3 rounded-md border border-[color:var(--steel-700)] bg-[color:var(--ink-950)]/60 p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {e.priority >= 9 ? (
                      <Flame className="h-4 w-4 text-[color:var(--gold)]" />
                    ) : (
                      <Zap className="h-4 w-4 text-[color:var(--pp-purple)]" />
                    )}
                    <span className="text-xs text-[color:var(--text-low)]">{e.game} • {e.user}</span>
                  </div>
                  <p className="text-[color:var(--text-high)]">{e.text}</p>
                </div>
                {e.isClutch && (
                  <Button
                    size="sm"
                    className="bg-[color:var(--gold)] text-black hover:opacity-90"
                    onClick={() => onFocusClutch(e)}
                  >
                    Clutch Time
                  </Button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CardContent>
    </Card>
  );
}