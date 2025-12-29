import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  totalSeconds: number;
  currentSeconds: number;
  isActive: boolean;
  label: string;
  variant?: "prep" | "recording";
}

export function CountdownTimer({
  totalSeconds,
  currentSeconds,
  isActive,
  label,
  variant = "prep"
}: CountdownTimerProps) {
  const remaining = Math.max(0, totalSeconds - currentSeconds);
  const progress = (currentSeconds / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  const isLowTime = remaining <= 5 && isActive;

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      
      <div className="relative w-28 h-28">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={variant === "recording" ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-3xl font-mono font-bold transition-colors",
              isLowTime && "text-destructive animate-pulse",
              variant === "recording" && isActive && "text-destructive"
            )}
          >
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      {isActive && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              variant === "recording"
                ? "bg-destructive animate-recording-pulse"
                : "bg-primary animate-pulse"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {variant === "recording" ? "Recording..." : "Preparing..."}
          </span>
        </div>
      )}
    </div>
  );
}
