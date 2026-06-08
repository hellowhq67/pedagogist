import { useState, useEffect, useCallback, useRef } from "react";

export type PermissionState = "granted" | "denied" | "prompt" | "unknown" | "requesting";

interface UseMicrophonePermissionReturn {
  permissionState: PermissionState;
  requestPermission: () => Promise<void>;
  stream: MediaStream | null;
  error: string | null;
}

export function useMicrophonePermission(autoRequest = true): UseMicrophonePermissionReturn {
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
    } catch (err: any) {
      console.error("Microphone permission error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setError("Microphone access was denied. Please enable it in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setPermissionState("denied");
        setError("No microphone found. Please connect a microphone and try again.");
      } else {
        setPermissionState("denied");
        setError("Could not access microphone. Please check your device and try again.");
      }
    }
  }, [permissionState]);

  useEffect(() => {
    if (!autoRequest) return;

    // Check permissions API first (Chrome/Edge)
    if (typeof navigator !== "undefined" && (navigator as any).permissions) {
      (navigator as any).permissions
        .query({ name: "microphone" })
        .then((result: any) => {
          if (result.state === "granted") {
            setPermissionState("granted");
          } else if (result.state === "denied") {
            setPermissionState("denied");
            setError("Microphone access is blocked. Please enable it in your browser settings.");
          } else {
            // prompt — auto request
            requestPermission();
          }

          // Listen for changes
          result.addEventListener("change", () => {
            if (result.state === "granted") {
              setPermissionState("granted");
              setError(null);
            } else if (result.state === "denied") {
              setPermissionState("denied");
              setError("Microphone access is blocked. Please enable it in your browser settings.");
            } else {
              setPermissionState("prompt");
            }
          });
        })
        .catch(() => {
          // Permissions API not supported or failed — just request
          requestPermission();
        });
    } else {
      // No permissions API — just request
      requestPermission();
    }
  }, [autoRequest, requestPermission]);

  return { permissionState, requestPermission, stream, error };
}
