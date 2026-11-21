import { Link } from "react-router-dom";
import { AlertTriangle, Zap } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AiScoreConfirmationDialogProps {
  open: boolean;
  credits: number;
  isScoring: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AiScoreConfirmationDialog({
  open,
  credits,
  isScoring,
  onOpenChange,
  onConfirm,
}: AiScoreConfirmationDialogProps) {
  const hasCredits = credits > 0;

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isScoring && onOpenChange(nextOpen)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {hasCredits ? <Zap className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>
          <AlertDialogTitle className="text-center">
            {hasCredits ? "Get an AI score?" : "No scoring credits left"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {hasCredits
              ? `You have ${credits} ${credits === 1 ? "credit" : "credits"}. This score uses 1 credit.`
              : "Upgrade your plan to get more AI score checks."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel disabled={isScoring}>Cancel</AlertDialogCancel>
          {hasCredits ? (
            <AlertDialogAction
              disabled={isScoring}
              onClick={(event) => {
                event.preventDefault();
                onConfirm();
              }}
            >
              Use 1 credit to get score
            </AlertDialogAction>
          ) : (
            <Button asChild>
              <Link to="/#pricing" onClick={() => onOpenChange(false)}>
                Upgrade for more credits
              </Link>
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
