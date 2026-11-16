import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  if (permissionState === "granted") return null;

  const isDenied = permissionState === "denied";
  const isRequestingPermission = isRequesting || permissionState === "requesting";

  return (
    <Alert className="border-primary/20 bg-primary/5">
      {isDenied ? <MicOff /> : <Mic />}
      <AlertTitle>{isDenied ? "Microphone access needed" : "Enable your microphone"}</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>
          {isDenied
            ? "Allow microphone access in your browser’s site settings, then retry. If this page is embedded in an app, open it in your browser."
            : "Allow microphone access to record and evaluate your speaking response."}
        </p>
        {error && (
          <p className="flex items-start gap-2 text-destructive" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        <Button
          onClick={handleRequest}
          disabled={isRequestingPermission}
          className="w-full gap-2 sm:w-fit"
        >
          {isDenied ? <Settings data-icon="inline-start" /> : <Mic data-icon="inline-start" />}
          {isRequestingPermission
            ? "Requesting permission..."
            : isDenied
              ? "Retry microphone access"
              : "Allow microphone access"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
