import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  member_email: string;
  role: string;
  status: string;
  invited_at: string;
}

export const TeamCollaboration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_owner_id', user.id)
        .order('invited_at', { ascending: false });
      
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!user?.id,
  });

  const inviteMember = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          team_owner_id: user.id,
          member_email: inviteEmail,
          role: inviteRole,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Invitation sent', description: `Invited ${inviteEmail} as ${inviteRole}` });
      setInviteEmail('');
      setInviteRole('viewer');
    },
    onError: (error) => {
      toast({ title: 'Failed to send invitation', description: error.message, variant: 'destructive' });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Member removed', description: 'Team member has been removed' });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Collaboration
        </CardTitle>
        <CardDescription>
          Invite team members to collaborate on friction analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Form */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Team Member
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="member-email">Email Address</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger id="member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer - View only access</SelectItem>
                <SelectItem value="analyst">Analyst - View and analyze data</SelectItem>
                <SelectItem value="admin">Admin - Full access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => inviteMember.mutate()}
            disabled={!inviteEmail || inviteMember.isPending}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </div>

        {/* Team Members List */}
        <div className="space-y-3">
          <h3 className="font-medium">Team Members</h3>
          {teamMembers && teamMembers.length > 0 ? (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.member_email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.member_email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        <Badge
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember.mutate(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No team members yet. Invite collaborators to get started!
            </p>
          )}
        </div>

        {/* Role Descriptions */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p><strong>Viewer:</strong> Can view dashboards and reports</p>
          <p><strong>Analyst:</strong> Can view, create cohorts, and generate reports</p>
          <p><strong>Admin:</strong> Full access including settings and team management</p>
        </div>
      </CardContent>
    </Card>
  );
};
