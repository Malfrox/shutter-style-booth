import { useRef, useState, useCallback, useEffect } from "react";

type CameraState = "idle" | "requesting" | "active" | "denied";

export function useCamera(facingMode: "user" | "environment" = "user") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState("idle");
  }, []);

  const start = useCallback(async (facing: "user" | "environment" = facingMode) => {
    stop();
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("active");
    } catch {
      setState("denied");
    }
  }, [facingMode, stop]);

  // cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { videoRef, state, start, stop } as const;
}
