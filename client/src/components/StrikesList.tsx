import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StrikeWithRelations } from "@shared/schema";

interface StrikesListProps {
  strikes: StrikeWithRelations[];
  isLoading: boolean;
}

export function StrikesList({ strikes, isLoading }: StrikesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!strikes || strikes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-green-600 dark:text-green-500" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No strikes</p>
        <p className="text-xs text-muted-foreground">
          Keep up the good work!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="strikes-list">
      {strikes.map((strike) => (
        <Card
          key={strike.id}
          className="p-4 border-l-4 border-l-destructive bg-destructive/5"
          data-testid={`card-strike-${strike.id}`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm text-foreground" data-testid="text-strike-reason">
                  {strike.reason}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(strike.issuedAt), "MMM dd, yyyy")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {strike.description}
              </p>
              {strike.supervisor && (
                <p className="text-xs text-muted-foreground">
                  Issued by: <span className="font-medium">{strike.supervisor.name}</span>
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
