"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type PartyType = "friendly" | "prize" | "competitive";

export function PartyCard({
  type,
  title,
  description,
  onJoin,
  className,
}: {
  type: PartyType;
  title: string;
  description: string;
  onJoin: (type: PartyType) => void;
  className?: string;
}) {
  const icon =
    type === "friendly" ? (
      <Users className="h-5 w-5" />
    ) : type === "prize" ? (
      <Trophy className="h-5 w-5" />
    ) : (
      <Crown className="h-5 w-5" />
    );

  return (
    <Card
      className={cn(
        "trophy-edge overflow-hidden border-[1px] border-[color:var(--steel-700)] bg-[color:var(--slate-900)]",
        className
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-[color:var(--pp-purple)]">{icon}<span className="text-xs uppercase tracking-wide text-[color:var(--text-mid)]">{type}</span></div>
        <CardTitle className="text-2xl font-bold text-[color:var(--text-high)]">{title}</CardTitle>
        <Badge className="w-fit bg-[color:var(--pp-purple)] text-black">Premium</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[color:var(--text-mid)]">{description}</p>
        <Button
          onClick={() => onJoin(type)}
          className="bg-[color:var(--pp-purple)] text-black hover:opacity-90"
        >
          Select
        </Button>
      </CardContent>
    </Card>
  );
}