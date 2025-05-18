
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FlaskConical, Zap, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestSuggestion {
  id: string;
  title: string;
  description: string;
  frictionPoint: string;
  elementType: string;
  estimatedLift: number;
  confidenceLevel: number;
  trafficAllocation: number;
  testDuration: number;
  variants: TestVariant[];
}

interface TestVariant {
  id: string;
  name: string;
  description: string;
  image?: string;
}

interface SmartTestPlannerProps {
  flowId?: string;
  tier?: 'rule-based' | 'ml-based';
}

export const SmartTestPlanner: React.FC<SmartTestPlannerProps> = ({ flowId, tier = 'rule-based' }) => {
  const { toast } = useToast();
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [testSuggestions] = useState<TestSuggestion[]>([
    {
      id: 'test-1',
      title: 'CTA Button Color Test',
      description: 'The current CTA button has a lower click rate than industry average. Test different colors to improve visibility.',
      frictionPoint: 'Low Click-Through Rate',
      elementType: 'Button',
      estimatedLift: 12.5,
      confidenceLevel: 95,
      trafficAllocation: 50,
      testDuration: 14,
      variants: [
        {
          id: 'variant-1',
          name: 'Control',
          description: 'Current blue button'
        },
        {
          id: 'variant-2',
          name: 'Green CTA',
          description: 'High contrast green button'
        },
        {
          id: 'variant-3',
          name: 'Red CTA',
          description: 'Urgent action red button'
        }
      ]
    },
    {
      id: 'test-2',
      title: 'Form Field Reduction',
      description: 'Users are abandoning the form. Test a version with fewer required fields to improve completion.',
      frictionPoint: 'Form Abandonment',
      elementType: 'Form',
      estimatedLift: 24.8,
      confidenceLevel: 95,
      trafficAllocation: 50,
      testDuration: 21,
      variants: [
        {
          id: 'variant-1',
          name: 'Control',
          description: 'Current form with 8 fields'
        },
        {
          id: 'variant-2',
          name: 'Minimal Form',
          description: 'Reduced form with 4 essential fields'
        },
        {
          id: 'variant-3',
          name: 'Progressive Form',
          description: 'Multi-step form with fields revealed progressively'
        }
      ]
    },
    {
      id: 'test-3',
      title: 'Product Description Layout',
      description: 'Users are not engaging with product details. Test different content layouts.',
      frictionPoint: 'Low Engagement',
      elementType: 'Content',
      estimatedLift: 8.3,
      confidenceLevel: 90,
      trafficAllocation: 40,
      testDuration: 14,
      variants: [
        {
          id: 'variant-1',
          name: 'Control',
          description: 'Current paragraph format'
        },
        {
          id: 'variant-2',
          name: 'Bullet Points',
          description: 'Key benefits as bullet points'
        },
        {
          id: 'variant-3',
          name: 'Visual Cards',
          description: 'Benefits displayed as visual cards with icons'
        }
      ]
    }
  ]);

  const toggleTest = (id: string) => {
    setExpandedTest(expandedTest === id ? null : id);
  };

  const handleExportTest = (testId: string) => {
    toast({
      title: "Test Brief Exported",
      description: "The test plan has been exported to your A/B testing platform.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {tier === 'ml-based' ? (
            <Zap className="h-5 w-5 text-primary" />
          ) : (
            <FlaskConical className="h-5 w-5 text-primary" />
          )}
          Smart Test Planner
          {tier === 'ml-based' && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              Enterprise
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Data-driven A/B test suggestions to improve conversion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions">
          <TabsList className="mb-4">
            <TabsTrigger value="suggestions">Suggested Tests</TabsTrigger>
            <TabsTrigger value="active">Active Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-4">
            {testSuggestions.map((test) => (
              <div key={test.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 bg-muted/30 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleTest(test.id)}
                >
                  <div>
                    <h4 className="font-medium">{test.title}</h4>
                    <p className="text-sm text-muted-foreground">{test.frictionPoint} • {test.elementType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {tier === 'ml-based' && (
                      <div className="text-right mr-2">
                        <div className="text-sm font-medium text-green-600">+{test.estimatedLift}%</div>
                        <div className="text-xs text-muted-foreground">Est. Lift</div>
                      </div>
                    )}
                    <Button variant="ghost" size="sm">
                      {expandedTest === test.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {expandedTest === test.id && (
                  <div className="p-4 border-t">
                    <p className="mb-4">{test.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Confidence Level:</span>
                          <span>{test.confidenceLevel}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Traffic Allocation:</span>
                          <span>{test.trafficAllocation}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Test Duration:</span>
                          <span>{test.testDuration} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Variants:</span>
                          <span>{test.variants.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-2">Test Variants</h5>
                      <div className="space-y-2">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                              {variant.id === 'variant-1' ? 'A' : variant.id === 'variant-2' ? 'B' : 'C'}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{variant.name}</div>
                              <div className="text-xs text-muted-foreground">{variant.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Edit Parameters
                      </Button>
                      <Button size="sm" className="flex items-center gap-2" onClick={() => handleExportTest(test.id)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Export to Testing Platform</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="active">
            <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
              <div>
                <p>No active tests running at the moment</p>
                <p className="text-sm mt-1">Create a test from suggestions to get started</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
              <div>
                <p>No completed tests yet</p>
                <p className="text-sm mt-1">Test results will appear here when tests are finished</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
