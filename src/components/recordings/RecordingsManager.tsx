import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Download, Loader2, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useFileStorage } from "@/hooks/useFileStorage";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const RecordingsManager = () => {
  const { user } = useAuth();
  const { useRecordings } = useFileStorage();
  const { data: recordings, isLoading } = useRecordings(user?.id || '');
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadRecording = async (recording: any) => {
    setSelectedRecording(recording);
    try {
      const response = await fetch(
        `https://nykvaozegqidulsgqrfg.supabase.co/storage/v1/object/public/session-recordings/${recording.storage_path}`
      );
      const data = await response.json();
      setPlaybackData(data);
    } catch (error) {
      console.error('Failed to load recording:', error);
    }
  };

  const playRecording = () => {
    if (!playbackData || playbackData.length === 0) return;
    
    setIsPlaying(true);
    
    // Simple playback simulation
    let currentIndex = 0;
    const playInterval = setInterval(() => {
      if (currentIndex >= playbackData.length) {
        clearInterval(playInterval);
        setIsPlaying(false);
        return;
      }
      
      const event = playbackData[currentIndex];
      console.log('Playback event:', event);
      // In a real implementation, you would replay the event here
      
      currentIndex++;
    }, 100);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Session Recordings
          </CardTitle>
          <CardDescription>
            View and analyze recorded user sessions with friction events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              Loading recordings...
            </div>
          ) : recordings && recordings.length > 0 ? (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Session {recording.session_id.slice(0, 8)}</h4>
                        {recording.friction_events_count > 0 && (
                          <Badge variant="destructive">
                            {recording.friction_events_count} friction events
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(recording.recording_start), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(recording.recording_start), 'p')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          <span>Duration: {formatDuration(recording.duration_seconds || 0)}</span>
                        </div>
                      </div>

                      {recording.metadata && typeof recording.metadata === 'object' && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-md">
                            {(recording.metadata as any).pageUrl || 'Unknown page'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadRecording(recording)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `https://nykvaozegqidulsgqrfg.supabase.co/storage/v1/object/public/session-recordings/${recording.storage_path}`;
                          link.download = `session-${recording.session_id}.json`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No session recordings yet</p>
              <p className="text-sm mt-2">
                Enable recording in your tracking SDK to capture user sessions
              </p>
              <div className="mt-4 p-3 bg-muted rounded-lg text-left max-w-md mx-auto">
                <code className="text-xs">
                  data-enable-recording="true"
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playback Dialog */}
      <Dialog open={!!selectedRecording} onOpenChange={() => setSelectedRecording(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Session Recording - {selectedRecording?.session_id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {playbackData ? (
              <>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {playbackData.length} events captured
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedRecording?.friction_events_count || 0} friction events detected
                    </p>
                  </div>
                  <Button onClick={playRecording} disabled={isPlaying}>
                    {isPlaying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Replay Session
                      </>
                    )}
                  </Button>
                </div>

                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h4 className="font-medium mb-3">Recording Timeline</h4>
                  <div className="space-y-2">
                    {playbackData.slice(0, 50).map((event: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 text-sm p-2 hover:bg-accent/50 rounded">
                        <Badge variant="outline" className="text-xs">
                          {(event.timestamp / 1000).toFixed(2)}s
                        </Badge>
                        <div className="flex-1">
                          <span className="font-medium">{event.type}</span>
                          {event.target && (
                            <span className="text-muted-foreground ml-2">
                              → {event.target}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {playbackData.length > 50 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        ... and {playbackData.length - 50} more events
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading recording data...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};