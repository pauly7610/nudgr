
import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Play, Calendar, User, Eye, Filter, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface JourneySessionProps {
  flow: Flow | null;
}

interface SessionRecording {
  id: string;
  userId: string;
  username: string;
  date: Date;
  duration: number;
  frictionPoints: number;
  completed: boolean;
}

export const SessionRecordings: React.FC<JourneySessionProps> = ({ flow }) => {
  const [selectedSession, setSelectedSession] = useState<SessionRecording | null>(null);
  
  if (!flow) return null;
  
  // Generate mock session recordings
  const generateSessions = () => {
    const sessions: SessionRecording[] = [];
    
    for (let i = 0; i < 8; i++) {
      const completed = Math.random() > 0.4;
      
      sessions.push({
        id: `session-${i+1}`,
        userId: `user-${Math.floor(Math.random() * 100000)}`,
        username: `User ${Math.floor(Math.random() * 100000)}`,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 600) + 30,
        frictionPoints: completed ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 5) + 3,
        completed: completed
      });
    }
    
    return sessions;
  };
  
  const sessions = generateSessions();
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">User Session Recordings</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Replay actual user sessions to identify pain points</p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>
      
      <div className="p-6">
        {selectedSession ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Viewing Session: {selectedSession.username}</h4>
              <Button variant="ghost" onClick={() => setSelectedSession(null)}>
                Back to List
              </Button>
            </div>
            
            <div className="border rounded-lg p-1">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Session playback would appear here</p>
                  <p className="text-sm text-muted-foreground mt-1">This is a placeholder for the actual recording player</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">User</div>
                <div className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedSession.username}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Date</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {selectedSession.date.toLocaleDateString()}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Duration</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(selectedSession.duration)}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Completion</div>
                <div className={`font-medium flex items-center gap-1 ${selectedSession.completed ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedSession.completed ? 'Completed' : 'Abandoned'}
                </div>
              </div>
            </div>
            
            <Alert variant={selectedSession.frictionPoints > 2 ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Friction Detected</AlertTitle>
              <AlertDescription>
                This session contained {selectedSession.frictionPoints} friction points that may indicate user struggles.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{session.username}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {session.date.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(session.duration)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Friction Points:</span>
                    <span className={session.frictionPoints > 2 ? 'text-red-600' : ''}>
                      {session.frictionPoints}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={session.completed ? 'text-green-600' : 'text-red-600'}>
                      {session.completed ? 'Completed' : 'Abandoned'}
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
  );
};
