import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
  className?: string;
  barCount?: number;
}

export function AudioWaveform({ 
  isRecording, 
  audioStream, 
  className,
  barCount = 32 
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.1));

  useEffect(() => {
    if (!isRecording || !audioStream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setBars(Array(barCount).fill(0.1));
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;
    
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const newBars: number[] = [];
      const step = Math.floor(dataArray.length / barCount);
      
      for (let i = 0; i < barCount; i++) {
        const index = Math.min(i * step, dataArray.length - 1);
        const value = dataArray[index] / 255;
        newBars.push(Math.max(0.1, value));
      }
      
      setBars(newBars);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, audioStream, barCount]);

  return (
    <div className={cn("flex items-center justify-center gap-1 h-16", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1.5 rounded-full transition-all duration-75",
            isRecording 
              ? "bg-gradient-to-t from-destructive to-destructive/60" 
              : "bg-muted-foreground/20"
          )}
          style={{
            height: `${height * 100}%`,
            minHeight: "4px",
            transform: isRecording ? `scaleY(${0.5 + height * 0.5})` : "scaleY(0.2)",
          }}
        />
      ))}
    </div>
  );
}
