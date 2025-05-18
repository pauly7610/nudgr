
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomPlaybookRequestProps {
  onBack?: () => void;
}

export const CustomPlaybookRequest: React.FC<CustomPlaybookRequestProps> = ({ onBack }) => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Request submitted",
      description: "We'll analyze your specific friction point and create a custom playbook.",
    });
    if (onBack) onBack();
  };
  
  return (
    <div>
      {onBack && (
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to playbooks</span>
          </Button>
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-4">Request Custom Playbook</h3>
      <p className="text-muted-foreground mb-6">
        Need help with a specific friction point? Our team will analyze your situation
        and create a custom playbook with targeted recommendations.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Playbook Title
          </label>
          <Input id="title" placeholder="E.g. Checkout abandonment reduction" required />
        </div>
        
        <div>
          <label htmlFor="friction-type" className="block text-sm font-medium mb-1">
            Friction Type
          </label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select friction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="form_abandonment">Form Abandonment</SelectItem>
              <SelectItem value="rage_clicks">Rage Clicks</SelectItem>
              <SelectItem value="navigation_loops">Navigation Loops</SelectItem>
              <SelectItem value="excessive_scrolling">Excessive Scrolling</SelectItem>
              <SelectItem value="other">Other (please describe)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea 
            id="description" 
            placeholder="Please describe the specific friction point you're encountering..." 
            rows={4}
            required
          />
        </div>
        
        <div className="pt-2">
          <Button type="submit" className="w-full">Request Playbook</Button>
        </div>
      </form>
    </div>
  );
};
