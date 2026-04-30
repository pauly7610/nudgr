import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Download, Loader2, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { type RecordingSummary, useFileStorage } from "@/hooks/useFileStorage";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SessionReplayPlayer } from "./SessionReplayPlayer";
import { useAnalyticsPropertyContext } from "@/contexts/AnalyticsPropertyContext";
import { useRecordingInsights } from "@/hooks/useGovernance";

export const RecordingsManager = () => {
  const { user } = useAuth();
  const { useRecordings } = useFileStorage();
  const { data: recordings, isLoading } = useRecordings(user?.id || '');
  const [selectedRecording, setSelectedRecording] = useState<RecordingSummary | null>(null);
  const { selectedProperty } = useAnalyticsPropertyContext();
  const { data: insights } = useRecordingInsights(selectedProperty?.id ?? null);

  const getRecordingDownloadUrl = (path: string) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;

    const baseUrl = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/recordings/${encodeURIComponent(path.replace(/^\/+/, ''))}`;
  };

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
          {insights && (
            <div className="mb-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Recordings</div>
                <div className="mt-1 text-2xl font-semibold">{insights.summary.recordings}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">With friction</div>
                <div className="mt-1 text-2xl font-semibold">{insights.summary.frictionRecordings}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Avg duration</div>
                <div className="mt-1 text-2xl font-semibold">{formatDuration(insights.summary.averageDurationSeconds)}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Masking</div>
                <div className="mt-1 text-sm font-medium">Enabled</div>
              </div>
            </div>
          )}

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
                            {(() => {
                              const metadata = recording.metadata as Record<string, unknown>;
                              const pageUrl = metadata.pageUrl;
                              return typeof pageUrl === 'string' ? pageUrl : 'Unknown page';
                            })()}
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
                          link.href = getRecordingDownloadUrl(recording.storage_path);
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
