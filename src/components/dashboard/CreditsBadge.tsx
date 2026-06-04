import { Link } from "react-router-dom";
import { Zap, Crown } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function CreditsBadge() {
  const { credits, tier } = useCredits();
  const isPaid = tier !== "free";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary"
          aria-label="Scoring credits"
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span className="tabular-nums">{credits}x</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" /> Scoring credits
              </p>
              <p className="text-xs text-muted-foreground">
                1 credit = 1 AI score check
              </p>
            </div>
            {isPaid && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Crown className="h-3 w-3" /> {tier.toUpperCase()}
              </span>
            )}
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-2xl font-bold tabular-nums">{credits}</p>
            <p className="text-xs text-muted-foreground">credits remaining</p>
          </div>
          <Button asChild size="sm" className="w-full">
            <Link to="/#pricing">Upgrade for more</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
