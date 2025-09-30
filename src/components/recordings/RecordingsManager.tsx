import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Download, Loader2, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useFileStorage } from "@/hooks/useFileStorage";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SessionReplayPlayer } from "./SessionReplayPlayer";

export const RecordingsManager = () => {
  const { user } = useAuth();
  const { useRecordings } = useFileStorage();
  const { data: recordings, isLoading } = useRecordings(user?.id || '');
  const [selectedRecording, setSelectedRecording] = useState<any>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                        onClick={() => setSelectedRecording(recording)}
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

      {/* Session Replay Dialog */}
      <Dialog open={!!selectedRecording} onOpenChange={() => setSelectedRecording(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Session Recording - {selectedRecording?.session_id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecording && (
            <SessionReplayPlayer
              recordingPath={selectedRecording.storage_path}
              sessionId={selectedRecording.session_id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
