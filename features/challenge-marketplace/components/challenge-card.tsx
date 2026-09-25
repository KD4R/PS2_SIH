"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { ChallengeCardData } from "../types";

export function ChallengeCard({ challenge, onApply }: { challenge: ChallengeCardData; onApply: () => void }) {
  return (
    <Card className="flex flex-col h-full bg-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge className="bg-transparent border text-foreground">{challenge.domain}</Badge>
          {challenge.budgetInr && (
            <Badge className="bg-secondary text-secondary-foreground font-mono">₹{challenge.budgetInr.toLocaleString()}</Badge>
          )}
        </div>
        <CardTitle className="mt-4">{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">{challenge.description}</p>
        {challenge.deadline && (
          <p className="text-xs text-muted-foreground mt-4">
            Deadline: {new Date(challenge.deadline).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onApply} disabled={challenge.status !== "open"}>
          {challenge.status === "open" ? "Apply for Pilot" : "Closed"}
        </Button>
      </CardFooter>
    </Card>
  );
}
