
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCohort } from '@/data/mockData';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface TechErrorsViewProps {
  cohort: UserCohort;
  onBack: () => void;
}

export const TechErrorsView: React.FC<TechErrorsViewProps> = ({
  cohort,
  onBack
}) => {
  // Mock data for technical errors
  const mockErrors = [
    { 
      id: 1, 
      type: "JavaScript Error", 
      message: "Cannot read property 'length' of undefined", 
      count: 187,
      page: "/checkout",
      browser: "Chrome"
    },
    { 
      id: 2, 
      type: "API Error", 
      message: "500 Internal Server Error on /api/user/preferences", 
      count: 43,
      page: "/account",
      browser: "Safari"
    },
    { 
      id: 3, 
      type: "Asset Loading Error", 
      message: "Failed to load resource: main.js", 
      count: 28,
      page: "/product",
      browser: "Firefox"
    }
  ];

  return (
    <div className="mt-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto flex items-center hover:text-primary hover:bg-transparent"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to cohort overview
        </Button>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">{cohort.name}</span>
        <span className="mx-2">/</span>
        <span className="text-muted-foreground">Technical Errors</span>
      </div>
    
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Technical Errors: {cohort.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            JavaScript errors and API failures affecting this cohort
          </p>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Technical Error Analysis
          </CardTitle>
          <CardDescription>
            Errors encountered by users in the {cohort.name} cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Error Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Page</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Browser</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Count</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {mockErrors.map((error) => (
                  <tr key={error.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{error.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{error.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{error.page}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{error.browser}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {error.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>These errors are encountered by users in this cohort. Fix these issues to improve conversion rates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
