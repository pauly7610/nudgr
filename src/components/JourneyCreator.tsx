import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';
import { useFrictionData } from '../hooks/useFrictionData';
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface JourneyCreatorProps {
  onClose: () => void;
  onCreated: (flowId: string) => void;
}

export const JourneyCreator: React.FC<JourneyCreatorProps> = ({ onClose, onCreated }) => {
  const { createFlow } = useFrictionData();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([
    { label: 'Start', users: 1000 },
    { label: 'End', users: 500 }
  ]);
  
  const addStep = () => {
    setSteps([...steps.slice(0, -1), { label: `Step ${steps.length}`, users: Math.floor(steps[0].users / 2) }, steps[steps.length - 1]]);
  };
  
  const removeStep = (index: number) => {
    if (steps.length <= 2) return; // Keep at least start and end
    setSteps(steps.filter((_, i) => i !== index));
  };
  
  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };
  
  const handleCreate = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Please provide a journey name",
        variant: "destructive",
      });
      return;
    }
    
    if (steps.length < 2) {
      toast({
        title: "Error",
        description: "Journey must have at least two steps",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate drop-off for each step
    const stepsWithDropOff = steps.map((step, index) => {
      if (index === 0) return step;
      
      const prevUsers = steps[index - 1].users;
      const dropOff = prevUsers - step.users;
      
      return {
        ...step,
        dropOff: dropOff > 0 ? dropOff : 0
      };
    });
    
    const flowId = createFlow({
      flow: name,
      steps: stepsWithDropOff
    });
    
    toast({
      title: "Journey Created",
      description: "Your new journey was created successfully",
    });
    
    onCreated(flowId);
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Journey</DialogTitle>
          <DialogDescription>
            Define the steps of your customer journey
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Journey Name</Label>
            <Input
              id="name"
              placeholder="e.g., Checkout Flow"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this journey"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Journey Steps</Label>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 border p-3 rounded-md">
                <div className="flex-1">
                  <Input
                    placeholder="Step name"
                    value={step.label}
                    onChange={(e) => updateStep(index, 'label', e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    placeholder="Users"
                    value={step.users}
                    onChange={(e) => updateStep(index, 'users', parseInt(e.target.value) || 0)}
                  />
                </div>
                {steps.length > 2 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => removeStep(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={addStep}
            >
              Add Step
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create Journey</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
