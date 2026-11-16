import { useState, useEffect, useCallback, useRef } from "react";

export type PermissionState = "granted" | "denied" | "prompt" | "unknown" | "requesting";

interface UseMicrophonePermissionReturn {
  permissionState: PermissionState;
  requestPermission: () => Promise<void>;
  stream: MediaStream | null;
  error: string | null;
}

export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [permissionState, setPermissionState] = useState<PermissionState>("unknown");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasRequested = useRef(false);

  const requestPermission = useCallback(async () => {
    if (hasRequested.current && permissionState === "requesting") return;
    hasRequested.current = true;
    setPermissionState("requesting");
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access requires a secure browser page. Open this test directly in your browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Stop the stream tracks immediately — we only needed permission
      mediaStream.getTracks().forEach((track) => track.stop());

      setPermissionState("granted");
      setStream(null);
    } catch (err: unknown) {
      console.error("Microphone permission error:", err);
      const errorName = err instanceof Error ? err.name : "";
      if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
        setPermissionState("denied");
        setError("Microphone access was blocked. Allow it in your browser’s site settings. If the test is embedded in another app, open it directly in your browser.");
      } else if (errorName === "NotFoundError") {
        setPermissionState("denied");
        setError("No microphone found. Please connect a microphone and try again.");
      } else {
        setPermissionState("denied");
        setError(
          err instanceof Error && err.message.includes("secure browser page")
            ? err.message
            : "Could not access microphone. Please check your device and try again.",
        );
      }
    }
  }, [permissionState]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;

    let isMounted = true;
    let permissionStatus: PermissionStatus | undefined;
    let permissionListener: (() => void) | undefined;

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        if (!isMounted) return;
        permissionStatus = result;

        const syncPermissionState = () => {
          if (result.state === "granted") {
            setPermissionState("granted");
            setError(null);
          } else if (result.state === "denied") {
            setPermissionState("denied");
            setError("Microphone access is blocked. Allow it in your browser’s site settings, then retry.");
          } else {
            setPermissionState("prompt");
            setError(null);
          }
        };

        syncPermissionState();
        permissionListener = syncPermissionState;
        result.addEventListener("change", syncPermissionState);
      })
      .catch(() => {
        // Some mobile browsers do not support querying microphone permission.
      });

    return () => {
      isMounted = false;
      if (permissionStatus && permissionListener) {
        permissionStatus.removeEventListener("change", permissionListener);
      }
    };
  }, []);

  return { permissionState, requestPermission, stream, error };
}
