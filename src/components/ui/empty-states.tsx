import { ReactNode } from 'react';
import { FileQuestion, Inbox, Users, Activity } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        {icon || <FileQuestion className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
};

export const NoDataEmptyState = () => (
  <EmptyState
    icon={<Inbox className="h-12 w-12 text-muted-foreground" />}
    title="No data yet"
    description="Start tracking friction events by installing the SDK on your website"
  />
);

export const NoTeamMembersEmptyState = () => (
  <EmptyState
    icon={<Users className="h-12 w-12 text-muted-foreground" />}
    title="No team members"
    description="Invite colleagues to collaborate on friction analytics"
  />
);

export const NoRecordingsEmptyState = () => (
  <EmptyState
    icon={<Activity className="h-12 w-12 text-muted-foreground" />}
    title="No recordings yet"
    description="Enable session recording in your tracking SDK to capture user sessions"
  />
);
