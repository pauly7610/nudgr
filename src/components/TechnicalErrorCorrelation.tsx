
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorData {
  id: string;
  type: string;
  message: string;
  count: number;
  impact: number;
  marketingCorrelation: {
    source?: string;
    campaign?: string;
    browser?: string;
    device?: string;
    pattern?: string;
  }
}

// Mock data for technical errors
const mockErrorData: ErrorData[] = [
  {
    id: "err-1",
    type: "JavaScript",
    message: "TypeError: Cannot read property 'value' of undefined",
    count: 342,
    impact: 78,
    marketingCorrelation: {
      source: "Google Ads",
      campaign: "Q2_Feature_Launch",
      browser: "Chrome Mobile",
      device: "Android",
      pattern: "Form submission on mobile"
    }
  },
  {
    id: "err-2",
    type: "API",
    message: "500 Internal Server Error during checkout",
    count: 128,
    impact: 92,
    marketingCorrelation: {
      source: "Facebook",
      campaign: "Retargeting_Campaign",
      browser: "Safari",
      device: "iOS",
      pattern: "Payment processing"
    }
  },
  {
    id: "err-3",
    type: "Resource",
    message: "Failed to load resource: the server responded with a status of 404",
    count: 267,
    impact: 45,
    marketingCorrelation: {
      source: "Direct Traffic",
      browser: "Chrome",
      device: "Desktop",
      pattern: "Product image loading"
    }
  },
  {
    id: "err-4",
    type: "Validation",
    message: "Form validation failed on email field",
    count: 534,
    impact: 62,
    marketingCorrelation: {
      source: "Email Newsletter",
      campaign: "Monthly_Digest",
      browser: "Firefox",
      device: "Desktop",
      pattern: "Newsletter signup"
    }
  },
  {
    id: "err-5",
    type: "Performance",
    message: "Script execution timed out",
    count: 189,
    impact: 73,
    marketingCorrelation: {
      source: "Organic Search",
      browser: "Edge",
      device: "Desktop",
      pattern: "Product filtering"
    }
  }
];

export const TechnicalErrorCorrelation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("impact");
  const [selectedError, setSelectedError] = useState<ErrorData | null>(null);
  
  // Sort errors based on active tab
  const sortedErrors = [...mockErrorData].sort((a, b) => {
    if (activeTab === "impact") {
      return b.impact - a.impact;
    } else {
      return b.count - a.count;
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-500" />
          Technical Error & Marketing Correlation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="impact" onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="impact">Highest Impact</TabsTrigger>
            <TabsTrigger value="frequency">Most Frequent</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {selectedError ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">{selectedError.type} Error</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedError(null)}
              >
                Back to list
              </Button>
            </div>
            
            <div className="p-3 bg-red-50 border border-red-100 rounded-md mb-4">
              <p className="font-mono text-sm">{selectedError.message}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-muted/30 rounded-md">
                <div className="text-sm text-muted-foreground">Occurrences</div>
                <div className="font-medium text-lg">{selectedError.count}</div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-md">
                <div className="text-sm text-muted-foreground">Impact Score</div>
                <div className={`font-medium text-lg ${
                  selectedError.impact > 70 ? 'text-red-600' : 
                  selectedError.impact > 50 ? 'text-amber-600' : 
                  'text-yellow-600'
                }`}>
                  {selectedError.impact}/100
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Marketing Correlation</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {selectedError.marketingCorrelation.source && (
                      <tr className="border-b">
                        <td className="p-2 bg-muted/20 font-medium">Traffic Source</td>
                        <td className="p-2">{selectedError.marketingCorrelation.source}</td>
                      </tr>
                    )}
                    {selectedError.marketingCorrelation.campaign && (
                      <tr className="border-b">
                        <td className="p-2 bg-muted/20 font-medium">Campaign</td>
                        <td className="p-2">{selectedError.marketingCorrelation.campaign}</td>
                      </tr>
                    )}
                    {selectedError.marketingCorrelation.browser && (
                      <tr className="border-b">
                        <td className="p-2 bg-muted/20 font-medium">Browser</td>
                        <td className="p-2">{selectedError.marketingCorrelation.browser}</td>
                      </tr>
                    )}
                    {selectedError.marketingCorrelation.device && (
                      <tr className="border-b">
                        <td className="p-2 bg-muted/20 font-medium">Device</td>
                        <td className="p-2">{selectedError.marketingCorrelation.device}</td>
                      </tr>
                    )}
                    {selectedError.marketingCorrelation.pattern && (
                      <tr>
                        <td className="p-2 bg-muted/20 font-medium">User Pattern</td>
                        <td className="p-2">{selectedError.marketingCorrelation.pattern}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Recommendation</span>
                </div>
                <p className="text-sm text-amber-800">
                  {selectedError.type === "API" && 
                    "Review server capacity for traffic spikes from this campaign. Consider implementing queue or throttling for high-volume periods."
                  }
                  {selectedError.type === "JavaScript" && 
                    "Add defensive null checks to handle undefined values. Test specifically on Android Chrome devices with emulators."
                  }
                  {selectedError.type === "Resource" && 
                    "Implement proper 404 handling and fallback images. Check CDN configuration for these specific resources."
                  }
                  {selectedError.type === "Validation" && 
                    "Review form validation logic and improve error messaging. Consider adding inline validation to prevent submission attempts."
                  }
                  {selectedError.type === "Performance" && 
                    "Optimize script execution and consider lazy-loading for this feature. Add performance monitoring specifically for Edge browser."
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedErrors.map((error) => (
              <div 
                key={error.id}
                className="p-3 border rounded-md cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-colors"
                onClick={() => setSelectedError(error)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{error.type} Error</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {error.message}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Impact</div>
                      <div className={`font-medium ${
                        error.impact > 70 ? 'text-red-600' : 
                        error.impact > 50 ? 'text-amber-600' : 
                        'text-yellow-600'
                      }`}>
                        {error.impact}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Count</div>
                      <div className="font-medium">{error.count}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs flex gap-2">
                  {error.marketingCorrelation.source && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-sm">
                      {error.marketingCorrelation.source}
                    </span>
                  )}
                  {error.marketingCorrelation.device && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-sm">
                      {error.marketingCorrelation.device}
                    </span>
                  )}
                  {error.marketingCorrelation.campaign && (
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded-sm truncate max-w-[120px]">
                      {error.marketingCorrelation.campaign}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex items-center justify-center gap-2 mt-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Error Data</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
