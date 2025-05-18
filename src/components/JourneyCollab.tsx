
import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Users, UserPlus, Mail, Clock } from 'lucide-react';
import { useToast } from "./ui/use-toast";
import { Badge } from './ui/badge';

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
}

export const JourneyCollab: React.FC<JourneyCollabProps> = ({ flow }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer');
  
  // Mock collaborators for this demo
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john.doe@example.com', 
      role: 'owner',
      lastActive: new Date()
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
      lastActive: new Date()
    };
    
    setCollaborators([...collaborators, newCollaborator]);
    setEmail('');
    
    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${email}`,
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
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Collaboration
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Invite team members to view or edit this journey map
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Invite Collaborators</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <div className="flex gap-2">
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
                    <Button variant="outline" size="sm">
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
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{user.lastActive?.toLocaleDateString()}</span>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
