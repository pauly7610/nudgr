
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TechnicalErrorCorrelation } from '@/components/TechnicalErrorCorrelation';
import { UserCohort } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Download, ExternalLink, Mail, Tag, Webhook } from 'lucide-react';

interface TechErrorsViewProps {
  cohort: UserCohort;
  onBack: () => void;
}

interface ErrorSegment {
  id: string;
  name: string;
  users: number;
  errorType: string;
  severity: 'low' | 'medium' | 'high';
}

export const TechErrorsView: React.FC<TechErrorsViewProps> = ({
  cohort,
  onBack
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('errors');
  const [exportPlatform, setExportPlatform] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Mock error segments based on cohort
  const errorSegments: ErrorSegment[] = [
    {
      id: '1',
      name: 'Payment Processing Error',
      users: Math.floor(Math.random() * 120) + 20,
      errorType: 'API Timeout',
      severity: 'high'
    },
    {
      id: '2',
      name: 'Form Validation Error',
      users: Math.floor(Math.random() * 80) + 10,
      errorType: 'Client Validation',
      severity: 'medium'
    },
    {
      id: '3',
      name: '404 Not Found',
      users: Math.floor(Math.random() * 50) + 5,
      errorType: 'Navigation',
      severity: 'low'
    }
  ];
  
  const handleExportAudience = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Audience Exported",
        description: `${cohort.name} audience with technical errors has been exported to ${exportPlatform}`,
      });
    }, 1500);
  };
  
  const handleTriggerWebhook = () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter a valid webhook URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    
    // Simulate webhook trigger
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Webhook Triggered",
        description: "Data sent to integration endpoint successfully",
      });
    }, 1500);
  };
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Technical Errors: {cohort.name}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            Back to Cohort
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="errors" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="export">Export Affected Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="errors">
          <TechnicalErrorCorrelation />
          
          <div className="mt-6 border rounded-lg p-4">
            <h3 className="font-medium mb-3">Error Segments</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Groups of users experiencing specific technical errors
            </p>
            
            <div className="space-y-3">
              {errorSegments.map(segment => (
                <div key={segment.id} className="border rounded-lg p-3">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{segment.name}</h4>
                    <Badge className={getSeverityColor(segment.severity)}>
                      {segment.severity.charAt(0).toUpperCase() + segment.severity.slice(1)} Severity
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Error Type</div>
                      <div>{segment.errorType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Affected Users</div>
                      <div>{segment.users}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setActiveTab('export')}
                    >
                      <Tag className="h-4 w-4" />
                      <span>Create Audience</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="export">
          <div className="border rounded-lg">
            <div className="bg-muted/50 px-4 py-3 border-b">
              <h3 className="font-semibold">Export Error Audience</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Create audiences from users experiencing technical errors for remediation campaigns
              </p>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Select Export Destination</label>
                  <Select value={exportPlatform} onValueChange={setExportPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a marketing platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="hubspot">HubSpot</SelectItem>
                      <SelectItem value="facebook">Facebook Ads</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="csv">CSV Download</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {exportPlatform && exportPlatform !== 'csv' && (
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label className="text-sm font-medium">Audience Name</label>
                      <span className="text-xs text-muted-foreground">Auto-generated</span>
                    </div>
                    <Input 
                      value={`${cohort.name} - Technical Error Users`}
                      readOnly
                    />
                  </div>
                )}
                
                {exportPlatform && (
                  <div className="pt-2">
                    <Button 
                      onClick={handleExportAudience}
                      disabled={isExporting || !exportPlatform}
                      className="flex items-center gap-2 w-full"
                    >
                      {exportPlatform === 'csv' ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      <span>
                        {isExporting ? 'Processing...' : 
                          exportPlatform === 'csv' ? 'Download CSV' : `Export to ${exportPlatform}`}
                      </span>
                    </Button>
                  </div>
                )}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or use webhook
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Send to Webhook</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Enter webhook URL"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleTriggerWebhook}
                      disabled={isExporting || !webhookUrl}
                      className="flex items-center gap-1"
                    >
                      <Webhook className="h-4 w-4" />
                      <span>Send</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect with Zapier, Make.com, or your custom integration
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Suggested: Send Recovery Email</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        We detected that most users in this segment abandoned after a technical error. 
                        Consider sending an apology email with a special offer.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 bg-white border-blue-200 text-blue-800 hover:bg-blue-50"
                      >
                        Create Email Campaign
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
