import { ScoreResult } from "@/lib/scoring";
import { CheckCircle, AlertCircle, Lightbulb, X, Share2, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useRef, useEffect } from "react";

interface ScoreDisplayProps {
  score: ScoreResult;
  spokenText?: string;
  originalText?: string;
  audioUrl?: string;
  onClose?: () => void;
  isModal?: boolean;
}

interface WordAnalysis {
  word: string;
  status: "good" | "average" | "poor" | "pause";
}

export function ScoreDisplay({ 
  score, 
  spokenText = "", 
  originalText = "",
  audioUrl,
  onClose,
  isModal = false
}: ScoreDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getScoreColor = (s: number) => {
    if (s >= 65) return "text-emerald-500";
    if (s >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBgColor = (s: number) => {
    if (s >= 65) return "bg-emerald-500";
    if (s >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  // Generate word analysis from spoken text comparison
  const analyzeWords = (): WordAnalysis[] => {
    if (!spokenText) return [];
    
    const spokenWords = spokenText.split(/\s+/).filter(Boolean);
    const originalWords = originalText ? originalText.toLowerCase().split(/\s+/).filter(Boolean) : [];
    
    return spokenWords.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
      
      // Check if word exists in original
      if (originalWords.includes(cleanWord)) {
        return { word, status: "good" as const };
      }
      
      // Check for filler words or hesitations
      if (["um", "uh", "er", "ah", "like", "you know"].includes(cleanWord)) {
        return { word, status: "poor" as const };
      }
      
      // Check for partial matches (close words)
      const hasPartialMatch = originalWords.some(orig => 
        orig.includes(cleanWord) || cleanWord.includes(orig) ||
        (orig.length > 3 && cleanWord.length > 3 && 
          (orig.slice(0, 3) === cleanWord.slice(0, 3)))
      );
      
      if (hasPartialMatch) {
        return { word, status: "average" as const };
      }
      
      // Default to based on overall score
      if (score.pronunciation >= 70) {
        return { word, status: "good" as const };
      } else if (score.pronunciation >= 50) {
        return { word, status: "average" as const };
      }
      return { word, status: "poor" as const };
    });
  };

  const wordAnalysis = analyzeWords();

  const getWordColor = (status: string) => {
    switch (status) {
      case "good": return "text-emerald-500";
      case "average": return "text-amber-500";
      case "poor": return "text-red-500";
      case "pause": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  // Audio player controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const getSuggestion = (component: string, scoreValue: number) => {
    if (component === "Content") {
      if (scoreValue >= 70) return "Good overall accuracy; content well captured with main meaning preserved.";
      if (scoreValue >= 50) return "Minor substitutions/omissions noted; main meaning preserved but some details missed.";
      return "Significant content gaps; key information missing or incorrect.";
    }
    if (component === "Pronunciation") {
      if (scoreValue >= 70) return "Generally clear and intelligible with natural speech patterns.";
      if (scoreValue >= 50) return "Occasional mis-articulations; some hesitation but overall understandable.";
      return "Frequent pronunciation errors affecting comprehension.";
    }
    if (component === "Fluency") {
      if (scoreValue >= 70) return "Smooth delivery with natural pacing and rhythm.";
      if (scoreValue >= 50) return "Some hesitations and fillers; pacing uneven at points but readable.";
      return "Major disruptions in speech flow; frequent pauses affecting communication.";
    }
    return "";
  };

  const scoreContent = (
    <div className="space-y-6 animate-score-reveal">
      {/* Component Scores Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Component</TableHead>
              <TableHead className="font-semibold text-center w-24">Score</TableHead>
              <TableHead className="font-semibold">Suggestion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Content</TableCell>
              <TableCell className="text-center">
                <span className={getScoreColor(score.content)}>{score.content}</span>/90
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getSuggestion("Content", score.content)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pronunciation</TableCell>
              <TableCell className="text-center">
                <span className={getScoreColor(score.pronunciation)}>{score.pronunciation}</span>/90
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getSuggestion("Pronunciation", score.pronunciation)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Fluency</TableCell>
              <TableCell className="text-center">
                <span className={getScoreColor(score.fluency)}>{score.fluency}</span>/90
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getSuggestion("Fluency", score.fluency)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Max/Your Score */}
      <div className="flex items-center gap-4 text-sm border-t pt-4">
        <span className="text-muted-foreground">Max Score: <span className="font-semibold text-foreground">90</span></span>
        <span className="text-muted-foreground">Your Score: <span className={`font-bold text-xl ${getScoreColor(score.overallScore)}`}>{score.overallScore}</span></span>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <span className="text-sm text-muted-foreground min-w-[100px]">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </span>
          
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          
          <audio ref={audioRef} src={audioUrl} className="hidden" />
        </div>
      )}

      {/* AI Speech Recognition */}
      {wordAnalysis.length > 0 && (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <span className="font-semibold">AI Speech Recognition:</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Good
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Average
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Poor
              </span>
              <span className="text-muted-foreground">/ Pause</span>
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="leading-loose text-lg">
              {wordAnalysis.map((item, i) => (
                <span key={i}>
                  <span 
                    className={`${getWordColor(item.status)} cursor-pointer hover:underline transition-colors`}
                    title={`${item.status.charAt(0).toUpperCase() + item.status.slice(1)} pronunciation`}
                  >
                    {item.word}
                  </span>
                  {item.status === "pause" ? " / " : " "}
                </span>
              ))}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Click on the colored text to view detailed score analysis
          </p>
        </div>
      )}

      {/* Detailed Analysis Sections */}
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-medium">
            <CheckCircle className="h-4 w-4" /> Strengths
          </div>
          <ul className="space-y-1 text-foreground text-sm">
            {score.detailedAnalysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2 text-amber-500 font-medium">
            <AlertCircle className="h-4 w-4" /> Areas to Improve
          </div>
          <ul className="space-y-1 text-foreground text-sm">
            {score.detailedAnalysis.improvements.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary font-medium">
            <Lightbulb className="h-4 w-4" /> Tips
          </div>
          <ul className="space-y-1 text-foreground text-sm">
            {score.detailedAnalysis.tips.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <Dialog open onOpenChange={() => onClose?.()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Score Details</DialogTitle>
          </DialogHeader>
          
          {scoreContent}
          
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return scoreContent;
}
