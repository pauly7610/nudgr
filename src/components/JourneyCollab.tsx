
import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Users, UserPlus, Mail, Clock, MessageCircle, Share2, Pencil, Eraser, Download, Undo2, Redo2 } from 'lucide-react';
import { useToast } from "./ui/use-toast";
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Label } from './ui/label';

interface JourneyCollabProps {
  flow: Flow | null;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatarUrl?: string;
  lastActive?: Date;
  online?: boolean;
}

interface Comment {
  id: string;
  user: Collaborator;
  content: string;
  timestamp: Date;
  step?: number;
}

export const JourneyCollab: React.FC<JourneyCollabProps> = ({ flow }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  // Mock collaborators for this demo
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john.doe@example.com', 
      role: 'owner',
      lastActive: new Date(),
      online: true
    },
    { 
      id: '2', 
      name: 'Emma Wilson', 
      email: 'emma.w@example.com', 
      role: 'editor',
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      online: true
    }
  ]);
  
  // Mock comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: collaborators[0],
      content: 'I noticed high drop-off at the payment step. We should redesign it.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      step: 3
    },
    {
      id: '2',
      user: collaborators[1],
      content: 'The form abandonment issue seems to be related to the validation errors not being clear enough.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      step: 2
    }
  ]);
  
  if (!flow) return null;
  
  const handleInvite = () => {
    if (!email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email: email,
      role: role,
      lastActive: new Date(),
      online: false
    };
    
    setCollaborators([...collaborators, newCollaborator]);
    setEmail('');
    
    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${email}`,
    });
  };
  
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      user: collaborators[0], // Assume current user is first in list
      content: commentText,
      timestamp: new Date(),
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the journey",
    });
  };
  
  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'owner':
        return <Badge variant="default">Owner</Badge>;
      case 'editor':
        return <Badge variant="secondary">Editor</Badge>;
      case 'viewer':
        return <Badge variant="outline">Viewer</Badge>;
      default:
        return null;
    }
  };
  
  const handleWhiteboardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Real-time Collaboration
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Work together on this journey map in real-time
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-6 pt-3">
          <TabsList>
            <TabsTrigger value="whiteboard" className="flex items-center gap-1">
              <Pencil className="h-4 w-4" />
              <span>Whiteboard</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>Comments</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="whiteboard" className="p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" /> Draw
                </Button>
                <Button variant="outline" size="sm">
                  <Eraser className="h-4 w-4 mr-1" /> Erase
                </Button>
                <div className="h-6 border-l mx-2"></div>
                <Button variant="outline" size="sm">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
            
            <div 
              className="border rounded-lg bg-white h-[400px] relative overflow-hidden"
              onMouseMove={handleWhiteboardMouseMove}
            >
              {/* Virtual whiteboard where people can draw and annotate */}
              <div className="absolute inset-0 p-4">
                <div className="text-center text-gray-400 mt-40">
                  Click and drag to start drawing on this collaborative whiteboard
                </div>
              </div>
              
              {/* Show other users' cursors */}
              {collaborators
                .filter(c => c.online && c.id !== '1') // Not the current user
                .map(user => (
                  <div 
                    key={user.id}
                    className="absolute flex flex-col items-center"
                    style={{ 
                      left: Math.random() * 80 + 10 + '%', 
                      top: Math.random() * 80 + 10 + '%',
                      pointerEvents: 'none'
                    }}
                  >
                    <div className="w-4 h-4 bg-blue-500 transform rotate-45"></div>
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md mt-1">
                      {user.name}
                    </div>
                  </div>
                ))
              }
              
              {/* Current user cursor position indicator */}
              <div 
                className="absolute w-4 h-4 bg-green-500 transform rotate-45 pointer-events-none"
                style={{ 
                  left: cursorPosition.x, 
                  top: cursorPosition.y,
                  transform: 'translate(-50%, -50%) rotate(45deg)'
                }}
              ></div>
            </div>
            
            <div className="mt-4 flex items-center">
              <span className="text-sm font-medium mr-2">Currently collaborating:</span>
              <div className="flex -space-x-2">
                {collaborators.filter(c => c.online).map((user) => (
                  <HoverCard key={user.id}>
                    <HoverCardTrigger asChild>
                      <Avatar className="border-2 border-background">
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-48">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs">{user.email}</p>
                        <p className="text-xs text-green-500 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Online now
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="comments" className="p-0">
          <div className="p-4">
            <div className="mb-4">
              <Label htmlFor="comment">Add a comment</Label>
              <div className="mt-1 flex">
                <Textarea 
                  id="comment"
                  placeholder="Add your thoughts or feedback..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 mr-2"
                />
                <Button onClick={handleAddComment}>Post</Button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-md p-3">
                  <div className="flex items-start">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{comment.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <div className="font-medium text-sm">{comment.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {comment.timestamp.toLocaleDateString()} at {comment.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className="mt-1 text-sm">{comment.content}</div>
                      {comment.step !== undefined && (
                        <div className="mt-1">
                          <Badge variant="outline">Step {comment.step + 1}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="team" className="p-0">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Invite Collaborators</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1"
                      />
                      <select
                        className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button onClick={handleInvite} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Send Invitation
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Sharing Options</h4>
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Public Share Link</h5>
                        <p className="text-sm text-muted-foreground">Anyone with the link can view</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          Generate Link
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Current Collaborators</h4>
                <div className="space-y-3">
                  {collaborators.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{user.name}</span>
                            {user.online && (
                              <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{user.online ? 'Online now' : user.lastActive?.toLocaleDateString()}</span>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
