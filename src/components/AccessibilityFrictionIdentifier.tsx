
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Eye, MousePointer, Keyboard, Lightbulb, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessibilityIssue {
  id: string;
  element: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  category: 'visual' | 'interaction' | 'keyboard' | 'other';
  frictionScore: number;
  affectedUsers: number;
  wcagGuideline?: string;
  recommendation: string;
  location: string;
}

// Mock data for accessibility issues
const mockAccessibilityIssues: AccessibilityIssue[] = [
  {
    id: 'a11y-1',
    element: 'Primary CTA Buttons',
    description: 'Low contrast ratio (2.8:1) between text and background colors',
    impact: 'serious',
    category: 'visual',
    frictionScore: 78,
    affectedUsers: 867,
    wcagGuideline: 'WCAG 1.4.3 Contrast (Minimum)',
    recommendation: 'Increase contrast to at least 4.5:1 for normal text or 3:1 for large text',
    location: 'Product Page, Checkout Flow'
  },
  {
    id: 'a11y-2',
    element: 'Form Fields',
    description: 'Missing form labels or using placeholder as label',
    impact: 'critical',
    category: 'visual',
    frictionScore: 85,
    affectedUsers: 1240,
    wcagGuideline: 'WCAG 1.3.1 Info and Relationships',
    recommendation: 'Add proper <label> elements that are programmatically associated with form controls',
    location: 'Signup Form, Contact Form'
  },
  {
    id: 'a11y-3',
    element: 'Navigation Menu',
    description: 'Not keyboard navigable, focus states missing',
    impact: 'critical',
    category: 'keyboard',
    frictionScore: 92,
    affectedUsers: 520,
    wcagGuideline: 'WCAG 2.1.1 Keyboard',
    recommendation: 'Ensure all interactive elements can be accessed and operated with keyboard alone',
    location: 'Global Header'
  },
  {
    id: 'a11y-4',
    element: 'Product Cards',
    description: 'Interactive elements too small and closely placed',
    impact: 'moderate',
    category: 'interaction',
    frictionScore: 65,
    affectedUsers: 935,
    wcagGuideline: 'WCAG 2.5.5 Target Size',
    recommendation: 'Ensure touch targets are at least 44×44 pixels in size and adequate spacing between them',
    location: 'Product Listing Pages'
  },
  {
    id: 'a11y-5',
    element: 'Modal Dialogs',
    description: 'Keyboard focus not trapped within modal',
    impact: 'serious',
    category: 'keyboard',
    frictionScore: 74,
    affectedUsers: 380,
    wcagGuideline: 'WCAG 2.4.3 Focus Order',
    recommendation: 'Trap keyboard focus within modal when open and restore focus when closed',
    location: 'Newsletter Signup, Product Quick View'
  },
  {
    id: 'a11y-6',
    element: 'Error Messages',
    description: 'Error states only indicated by color',
    impact: 'serious',
    category: 'visual',
    frictionScore: 72,
    affectedUsers: 428,
    wcagGuideline: 'WCAG 1.4.1 Use of Color',
    recommendation: 'Add icons, text, and patterns in addition to color to convey error states',
    location: 'Checkout Form, Login Form'
  }
];

export const AccessibilityFrictionIdentifier: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<AccessibilityIssue | null>(null);
  
  // Filter issues based on active tab
  const filteredIssues = activeTab === 'all' 
    ? mockAccessibilityIssues 
    : mockAccessibilityIssues.filter(issue => issue.category === activeTab);
  
  // Calculate overall accessibility score
  const calculateScore = () => {
    const totalIssues = mockAccessibilityIssues.length;
    const criticalWeight = 4;
    const seriousWeight = 3;
    const moderateWeight = 2;
    const minorWeight = 1;
    
    const totalWeight = mockAccessibilityIssues.reduce((sum, issue) => {
      switch(issue.impact) {
        case 'critical': return sum + criticalWeight;
        case 'serious': return sum + seriousWeight;
        case 'moderate': return sum + moderateWeight;
        case 'minor': return sum + minorWeight;
        default: return sum;
      }
    }, 0);
    
    const maxPossibleScore = totalIssues * criticalWeight;
    const score = 100 - ((totalWeight / maxPossibleScore) * 100);
    
    return Math.round(score);
  };
  
  const accessibilityScore = calculateScore();
  
  // Helper to get color for impact level
  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'serious': return 'bg-amber-100 text-amber-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'minor': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Helper to get icon for category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'visual': return <Eye className="h-4 w-4" />;
      case 'interaction': return <MousePointer className="h-4 w-4" />;
      case 'keyboard': return <Keyboard className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            <span>Accessibility Friction Identifier</span>
          </div>
          {!selectedIssue && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">Overall Score:</span>
              <span className={`text-sm font-medium ${
                accessibilityScore >= 80 ? 'text-green-600' :
                accessibilityScore >= 60 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {accessibilityScore}/100
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedIssue ? (
          <>
            <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All Issues</TabsTrigger>
                <TabsTrigger value="visual">Visual</TabsTrigger>
                <TabsTrigger value="interaction">Interaction</TabsTrigger>
                <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-3">
              {filteredIssues.map(issue => (
                <div 
                  key={issue.id}
                  className="p-3 border rounded-md cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-colors"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{issue.element}</div>
                      <div className="text-sm text-muted-foreground">{issue.description}</div>
                    </div>
                    <div className={`px-2 py-0.5 text-xs rounded-full ${getImpactColor(issue.impact)}`}>
                      {issue.impact.charAt(0).toUpperCase() + issue.impact.slice(1)}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {getCategoryIcon(issue.category)}
                      <span>{issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Friction Score:</span>{" "}
                      <span className="font-medium">{issue.frictionScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">{selectedIssue.element}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIssue(null)}
              >
                Back to list
              </Button>
            </div>
            
            <div className="p-3 bg-muted/30 border rounded-md mb-4">
              <p>{selectedIssue.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Impact Level</div>
                <div className={`inline-block px-2 py-0.5 text-sm rounded-full ${getImpactColor(selectedIssue.impact)}`}>
                  {selectedIssue.impact.charAt(0).toUpperCase() + selectedIssue.impact.slice(1)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(selectedIssue.category)}
                  <span>{selectedIssue.category.charAt(0).toUpperCase() + selectedIssue.category.slice(1)}</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Friction Score</div>
                <div className="flex items-center gap-2">
                  <Progress value={selectedIssue.frictionScore} className="h-2 w-20" />
                  <span className="text-sm font-medium">{selectedIssue.frictionScore}/100</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Affected Users</div>
                <div className="font-medium">{selectedIssue.affectedUsers.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Detected in</div>
              <div className="font-medium">{selectedIssue.location}</div>
            </div>
            
            {selectedIssue.wcagGuideline && (
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">WCAG Guideline</div>
                <div className="flex items-center gap-1 text-blue-600">
                  <span className="font-medium">{selectedIssue.wcagGuideline}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </div>
            )}
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-1.5 mb-2 text-green-700">
                <Lightbulb className="h-4 w-4" />
                <span className="font-medium">Recommendation</span>
              </div>
              <p className="text-sm text-green-800">{selectedIssue.recommendation}</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Marketing Impact:</span>
              <span className="font-medium">
                {selectedIssue.frictionScore > 80 ? 'Very High' :
                 selectedIssue.frictionScore > 60 ? 'High' :
                 selectedIssue.frictionScore > 40 ? 'Medium' : 'Low'
                } impact on conversion rates
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
