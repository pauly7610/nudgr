
import React from 'react';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { CheckCircle2, AlertCircle, BookText, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarketingPlaybook } from './types/marketingPlaybookTypes';

interface PlaybookDetailsProps {
  playbook: MarketingPlaybook | null;
  onBack?: () => void;
}

export const PlaybookDetails: React.FC<PlaybookDetailsProps> = ({ playbook, onBack }) => {
  const { toast } = useToast();
  
  if (!playbook) return null;
  
  const handleExport = () => {
    toast({
      title: "Playbook exported",
      description: "The playbook has been exported to PDF format",
    });
  };
  
  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <BookText className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <SheetHeader className="flex items-center">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <SheetTitle>{playbook.title}</SheetTitle>
      </SheetHeader>
      
      <div className="py-6 space-y-6">
        <div>
          <h3 className="font-medium mb-2">Playbook Overview</h3>
          <p className="text-muted-foreground">{playbook.description}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Implementation Steps</h3>
            <Badge variant="outline">
              {playbook.steps.filter(s => s.status === 'success').length}/{playbook.steps.length} complete
            </Badge>
          </div>
          
          <div className="space-y-3">
            {playbook.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(step.status) || (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {playbook.beforeAfterData && (
          <div>
            <h3 className="font-medium mb-3">Before/After Impact</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    type="category"
                    allowDuplicatedCategory={false}
                  />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Line 
                    name="Before"
                    data={playbook.beforeAfterData.before} 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#9f7aea" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    name="After"
                    data={playbook.beforeAfterData.after} 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3182ce" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#9f7aea]" />
                <span className="text-sm">Before</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#3182ce]" />
                <span className="text-sm">After</span>
              </div>
            </div>
          </div>
        )}
        
        {playbook.relatedCases && playbook.relatedCases.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Related Case Studies</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playbook.relatedCases.map((caseStudy, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{caseStudy.company}</TableCell>
                    <TableCell>{caseStudy.industry}</TableCell>
                    <TableCell>{caseStudy.outcome}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            className="w-full" 
            onClick={handleExport}
          >
            Export Playbook
          </Button>
        </div>
      </div>
    </>
  );
};
