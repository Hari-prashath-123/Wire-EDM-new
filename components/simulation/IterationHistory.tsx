"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SimulationIteration } from "./types";
import CutoutShape from "./CutoutShape";

interface IterationHistoryProps {
  iterations: SimulationIteration[];
  maxIterations: number;
  onClear: () => void;
}

export const IterationHistory: React.FC<IterationHistoryProps> = ({ iterations, maxIterations, onClear }) => {
  const limitReached = iterations.length >= maxIterations;

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">Iteration History</CardTitle>
          <CardDescription>
            Saved simulation runs ({iterations.length} / {maxIterations})
          </CardDescription>
        </div>
        {iterations.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear History
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {limitReached && iterations.length > 0 && (
          <p className="text-sm text-center font-medium text-destructive mb-4">
            Iteration limit reached. Clear history to save new runs.
          </p>
        )}
        <ScrollArea className="h-48 w-full pr-4">
          {iterations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Complete a simulation to save it here.
            </p>
          ) : (
            <div className="space-y-3">
              {iterations.map((iter, index) => (
                <div key={iter.id} className="p-3 bg-background rounded-lg border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Iteration {iterations.length - index}</span>
                    <span className="text-xs text-muted-foreground">{iter.material} / {iter.shapeName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-x-3 mb-2">
                    <span>Volt: <span className="text-foreground">{iter.parameters.voltage}V</span></span>
                    <span>Current: <span className="text-foreground">{iter.parameters.current}A</span></span>
                    <span>Speed: <span className="text-foreground">{iter.parameters.wireSpeed}</span></span>
                  </div>
                  {/* Render the actual cutout shape for this iteration */}
                  <div style={{ width: 120, height: 60 }}>
                    <CutoutShape points={iter.cutoutPoints} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default IterationHistory;
