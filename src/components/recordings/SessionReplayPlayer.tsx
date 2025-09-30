import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, FastForward, Rewind } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SessionReplayPlayerProps {
  recordingPath: string;
  sessionId: string;
}

interface RecordingEvent {
  type: 'snapshot' | 'mutation' | 'mouse' | 'click' | 'scroll';
  timestamp: number;
  [key: string]: any;
}

export const SessionReplayPlayer = ({ recordingPath, sessionId }: SessionReplayPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [events, setEvents] = useState<RecordingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSnapshot, setCurrentSnapshot] = useState<string>('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const lastEventIndexRef = useRef(0);

  useEffect(() => {
    loadRecording();
    return () => {
      if (playbackTimerRef.current) {
        cancelAnimationFrame(playbackTimerRef.current);
      }
    };
  }, [recordingPath]);

  const loadRecording = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('session-recordings')
        .download(recordingPath);

      if (error) throw error;

      const text = await data.text();
      const recordingData: RecordingEvent[] = JSON.parse(text);
      
      setEvents(recordingData);
      
      // Find duration from last event
      if (recordingData.length > 0) {
        const lastEvent = recordingData[recordingData.length - 1];
        setDuration(lastEvent.timestamp);
      }

      // Load initial snapshot
      const snapshot = recordingData.find(e => e.type === 'snapshot');
      if (snapshot) {
        setCurrentSnapshot(snapshot.html);
      }
    } catch (error) {
      console.error('Failed to load recording:', error);
    } finally {
      setLoading(false);
    }
  };

  const playRecording = () => {
    setIsPlaying(true);
    let startTime = performance.now();
    let pausedAt = currentTime;

    const tick = (timestamp: number) => {
      if (!isPlaying) return;

      const elapsed = (timestamp - startTime) * playbackSpeed;
      const newTime = pausedAt + elapsed;

      if (newTime >= duration) {
        setIsPlaying(false);
        setCurrentTime(duration);
        return;
      }

      setCurrentTime(newTime);
      processEventsUpToTime(newTime);
      playbackTimerRef.current = requestAnimationFrame(tick);
    };

    playbackTimerRef.current = requestAnimationFrame(tick);
  };

  const pauseRecording = () => {
    setIsPlaying(false);
    if (playbackTimerRef.current) {
      cancelAnimationFrame(playbackTimerRef.current);
    }
  };

  const processEventsUpToTime = (time: number) => {
    for (let i = lastEventIndexRef.current; i < events.length; i++) {
      const event = events[i];
      if (event.timestamp > time) break;

      switch (event.type) {
        case 'snapshot':
          setCurrentSnapshot(event.html);
          break;
        case 'mouse':
          setMousePosition({ x: event.x, y: event.y });
          break;
        case 'click':
          // Flash click animation
          setMousePosition({ x: event.x, y: event.y });
          break;
        case 'scroll':
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.scrollTo(event.scrollX, event.scrollY);
          }
          break;
      }

      lastEventIndexRef.current = i + 1;
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    lastEventIndexRef.current = 0;
    processEventsUpToTime(newTime);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    lastEventIndexRef.current = 0;
    const snapshot = events.find(e => e.type === 'snapshot');
    if (snapshot) {
      setCurrentSnapshot(snapshot.html);
    }
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds * 1000));
    setCurrentTime(newTime);
    lastEventIndexRef.current = 0;
    processEventsUpToTime(newTime);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (iframeRef.current && currentSnapshot) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(currentSnapshot);
        doc.close();
      }
    }
  }, [currentSnapshot]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p>Loading recording...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Replay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback viewport */}
        <div className="relative border rounded-lg overflow-hidden bg-background" style={{ height: '600px' }}>
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            sandbox="allow-same-origin"
            title="Session Replay"
          />
          
          {/* Mouse cursor overlay */}
          <div
            className="absolute w-4 h-4 bg-primary rounded-full pointer-events-none transition-all duration-100"
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={100}
            onValueChange={handleSeek}
            disabled={isPlaying}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={() => skip(-10)}>
            <Rewind className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {isPlaying ? (
            <Button size="icon" onClick={pauseRecording}>
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={playRecording}>
              <Play className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="outline" size="icon" onClick={() => skip(10)}>
            <FastForward className="h-4 w-4" />
          </Button>

          {/* Speed control */}
          <div className="flex gap-1 ml-4">
            {[0.5, 1, 1.5, 2].map(speed => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Event log */}
        <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
          <h4 className="font-semibold mb-2 text-sm">Event Timeline</h4>
          <div className="space-y-1 text-xs">
            {events.slice(0, 20).map((event, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span className="capitalize">{event.type}</span>
                <span>{formatTime(event.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
