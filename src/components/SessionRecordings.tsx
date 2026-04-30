import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Calendar, Eye, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { useSessionRecordings, type SessionRecordingSummary } from '@/hooks/useSessionRecordings';
import { SessionReplayPlayer } from '@/components/recordings/SessionReplayPlayer';

interface JourneySessionProps {
  flow: Flow | null;
}

export const SessionRecordings: React.FC<JourneySessionProps> = ({ flow }) => {
  const { selectedProperty } = useAnalyticsPropertyContext();
  const { data: sessions = [], isLoading } = useSessionRecordings(selectedProperty?.id ?? null);
  const [selectedSession, setSelectedSession] = useState<SessionRecordingSummary | null>(null);
  
  if (!flow) return null;

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) {
      return 'Unknown';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMetadataString = (session: SessionRecordingSummary, key: string, fallback: string) => {
    const value = session.metadata?.[key];
    return typeof value === 'string' && value.length > 0 ? value : fallback;
  };
  
  return (
    <FeatureGate 
      feature="sessionRecordings"
      featureName="Session Recordings"
      description="Record and replay user sessions to identify friction"
    >
      <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">User Session Recordings</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Replay actual user sessions to identify pain points</p>
        </div>
      </div>
      
      <div className="p-6">
        {selectedSession ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Viewing Session: {selectedSession.session_id}</h4>
              <Button variant="ghost" onClick={() => setSelectedSession(null)}>
                Back to List
              </Button>
            </div>
            
            <SessionReplayPlayer
              recordingPath={selectedSession.storage_path}
              sessionId={selectedSession.session_id}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Session</div>
                <div className="font-medium truncate">
                  {selectedSession.session_id}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Date</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedSession.recording_start).toLocaleDateString()}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Duration</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(selectedSession.duration_seconds)}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Friction Events</div>
                <div className={`font-medium ${selectedSession.friction_events_count > 2 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedSession.friction_events_count}
                </div>
              </div>
            </div>
            
            <Alert variant={selectedSession.friction_events_count > 2 ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Friction Detected</AlertTitle>
              <AlertDescription>
                This session contained {selectedSession.friction_events_count} friction points that may indicate user struggles.
              </AlertDescription>
            </Alert>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading session recordings...
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No recordings have been uploaded yet. Enable sampled recordings in the install snippet, then open the connected site.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="truncate text-base">
                    {getMetadataString(session, 'siteUserId', session.session_id)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(session.recording_start).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(session.duration_seconds)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Friction Points:</span>
                    <span className={session.friction_events_count > 2 ? 'text-red-600' : ''}>
                      {session.friction_events_count}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span>
                      {session.file_size_bytes ? `${Math.round(Number(session.file_size_bytes) / 1024)} KB` : 'Unknown'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => setSelectedSession(session)}
                  >
                    <Eye className="h-4 w-4" />
                    View Recording
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </FeatureGate>
  );
};
