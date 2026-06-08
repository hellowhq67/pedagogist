import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic, MicOff, Settings, AlertCircle } from "lucide-react";
import { PermissionState } from "@/hooks/useMicrophonePermission";

interface MicrophonePermissionDialogProps {
  permissionState: PermissionState;
  onRequestPermission: () => Promise<void>;
  error: string | null;
}

export function MicrophonePermissionDialog({
  permissionState,
  onRequestPermission,
  error,
}: MicrophonePermissionDialogProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async () => {
    setIsRequesting(true);
    await onRequestPermission();
    setIsRequesting(false);
  };

  // Only show dialog when NOT granted
  const isOpen = permissionState !== "granted" && permissionState !== "unknown";

  const isDenied = permissionState === "denied";
  const isPrompt = permissionState === "prompt" || permissionState === "requesting";

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {isDenied ? (
              <MicOff className="w-8 h-8 text-destructive" />
            ) : (
              <Mic className="w-8 h-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-xl">
            {isDenied ? "Microphone Access Denied" : "Enable Microphone"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isDenied
              ? "We need microphone access to record your speaking responses. Please enable it to continue practicing."
              : "This speaking test requires microphone access to record and evaluate your responses."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <h4 className="font-medium text-sm">Why we need microphone access:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Record your speaking responses for AI scoring
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Analyze pronunciation, fluency, and content accuracy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Save recordings to review your progress over time
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {isDenied ? (
              <>
                <div className="text-sm text-muted-foreground text-center">
                  <p className="mb-2">To enable microphone access:</p>
                  <ol className="text-left space-y-1 list-decimal list-inside">
                    <li>Click the lock/info icon in your browser address bar</li>
                    <li>Find "Microphone" and set it to "Allow"</li>
                    <li>Refresh the page and try again</li>
                  </ol>
                </div>
                <Button onClick={handleRequest} disabled={isRequesting} className="w-full gap-2">
                  <Settings className="w-4 h-4" />
                  {isRequesting ? "Checking..." : "I've Enabled Microphone — Retry"}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleRequest}
                disabled={isRequesting || permissionState === "requesting"}
                className="w-full gap-2"
              >
                <Mic className="w-4 h-4" />
                {isRequesting || permissionState === "requesting"
                  ? "Requesting Permission..."
                  : "Allow Microphone Access"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
