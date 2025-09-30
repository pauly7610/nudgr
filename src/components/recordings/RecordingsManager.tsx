import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Loader2, Play, Download } from "lucide-react";
import { format } from "date-fns";
import { useFileStorage } from "@/hooks/useFileStorage";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export const RecordingsManager = () => {
  const { user } = useAuth();
  const { useRecordings } = useFileStorage();
  const { data: recordings, isLoading } = useRecordings(user?.id || '');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Session Recordings
        </CardTitle>
        <CardDescription>
          View and manage recorded user sessions with friction events
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
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Session {recording.session_id.slice(0, 8)}</h4>
                      {recording.friction_events_count > 0 && (
                        <Badge variant="destructive">
                          {recording.friction_events_count} friction events
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recording details
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(recording.recording_start), 'PPP p')}
                      </span>
                      <span>
                        Duration: {formatDuration(recording.duration_seconds || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://nykvaozegqidulsgqrfg.supabase.co/storage/v1/object/public/session-recordings/${recording.storage_path}`, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `https://nykvaozegqidulsgqrfg.supabase.co/storage/v1/object/public/session-recordings/${recording.storage_path}`;
                        link.download = `session-${recording.session_id}.webm`;
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
            <p className="text-sm">Recordings will appear here once uploaded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};