
import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageSquare, Plus, Trash } from 'lucide-react';
import { useFrictionData } from '../hooks/useFrictionData';
import { useToast } from "./ui/use-toast";

interface JourneyAnnotationsProps {
  flow: Flow | null;
}

interface Annotation {
  id: string;
  stepIndex: number;
  text: string;
  createdBy: string;
  createdAt: Date;
}

export const JourneyAnnotations: React.FC<JourneyAnnotationsProps> = ({ flow }) => {
  const { toast } = useToast();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  
  if (!flow) return null;
  
  const handleAddAnnotation = () => {
    if (!newAnnotation.trim() || selectedStep === null) {
      toast({
        title: "Error",
        description: "Please select a step and enter an annotation",
        variant: "destructive",
      });
      return;
    }
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      stepIndex: selectedStep,
      text: newAnnotation,
      createdBy: "Current User",
      createdAt: new Date()
    };
    
    setAnnotations([...annotations, annotation]);
    setNewAnnotation('');
    
    toast({
      title: "Annotation Added",
      description: "Your annotation has been added to the step",
    });
  };
  
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    
    toast({
      title: "Annotation Removed",
      description: "The annotation has been removed",
    });
  };
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Journey Annotations
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Add notes and insights about specific steps in the journey
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Add New Annotation</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="step-select" className="block text-sm font-medium mb-1">Select Step</label>
                <select 
                  id="step-select"
                  className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={selectedStep !== null ? selectedStep : ''}
                  onChange={(e) => setSelectedStep(parseInt(e.target.value))}
                >
                  <option value="">Select a step...</option>
                  {flow.steps.map((step, index) => (
                    <option key={index} value={index}>
                      {step.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="annotation-text" className="block text-sm font-medium mb-1">Annotation</label>
                <Input
                  id="annotation-text"
                  placeholder="Enter your notes about this step..."
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                />
              </div>
              
              <Button onClick={handleAddAnnotation} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Annotation
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Existing Annotations</h4>
            {annotations.length === 0 ? (
              <div className="text-center p-8 border rounded-md">
                <p className="text-muted-foreground">No annotations yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add notes to document insights about steps in this journey</p>
              </div>
            ) : (
              <div className="space-y-3">
                {annotations.map((annotation) => (
                  <div key={annotation.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {flow.steps[annotation.stepIndex].label}
                        </div>
                        <p className="mt-1">{annotation.text}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          Added by {annotation.createdBy} on {annotation.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteAnnotation(annotation.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
