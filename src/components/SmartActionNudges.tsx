
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BadgeCheck, Check, MoreHorizontal, PlusCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';

interface NudgeAction {
  id: string;
  title: string;
  description: string;
  type: 'design' | 'content' | 'functionality' | 'technical';
  impact: 'high' | 'medium' | 'low';
  frictionPoint: string;
  playbook?: string;
}

interface SmartActionNudgesProps {
  flowId?: string;
}

export const SmartActionNudges: React.FC<SmartActionNudgesProps> = ({ flowId }) => {
  const { toast } = useToast();
  const [nudges, setNudges] = useState<NudgeAction[]>([
    {
      id: 'nudge-1',
      title: 'Simplify Form Fields',
      description: 'Reduce form fields in the booking form to improve completion rates.',
      type: 'design',
      impact: 'high',
      frictionPoint: 'Form Abandonment',
      playbook: 'Form Optimization'
    },
    {
      id: 'nudge-2',
      title: 'Clarify Pricing Display',
      description: 'The pricing table is causing confusion. Consider reorganizing to highlight value.',
      type: 'content',
      impact: 'high',
      frictionPoint: 'Rage Clicks',
      playbook: 'Pricing Page Clarity'
    },
    {
      id: 'nudge-3',
      title: 'Improve Mobile Navigation',
      description: 'Mobile users are struggling with menu navigation. Consider a simplified mobile menu.',
      type: 'functionality',
      impact: 'medium',
      frictionPoint: 'Navigation Loops',
      playbook: 'Mobile UX Patterns'
    }
  ]);

  const handleDismiss = (id: string) => {
    setNudges(nudges.filter(nudge => nudge.id !== id));
    toast({
      title: "Nudge dismissed",
      description: "The action suggestion has been removed.",
    });
  };

  const handleAssign = (id: string) => {
    // In a real app, this would open a task assignment modal
    toast({
      title: "Task created",
      description: "This task has been added to your team's backlog.",
    });
    // Remove from nudges after assigning
    setNudges(nudges.filter(nudge => nudge.id !== id));
  };

  const getImpactClass = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (nudges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            Smart Action Nudges
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions to fix friction points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted/50">
            <AlertTitle>No active nudges</AlertTitle>
            <AlertDescription>
              All suggested actions have been addressed or dismissed. Great job!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          Smart Action Nudges
        </CardTitle>
        <CardDescription>
          AI-powered suggestions to fix friction points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nudges.map((nudge) => (
            <div 
              key={nudge.id} 
              className={`p-4 border rounded-lg ${getImpactClass(nudge.impact)}`}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{nudge.title}</h4>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleAssign(nudge.id)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">Assign</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleDismiss(nudge.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </div>
              </div>
              <p className="text-sm mt-2">{nudge.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-white bg-opacity-50">
                  {nudge.frictionPoint}
                </span>
                {nudge.playbook && (
                  <a href="#" className="text-xs text-primary hover:underline">
                    View Playbook: {nudge.playbook}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
