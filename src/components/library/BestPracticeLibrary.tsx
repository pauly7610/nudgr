
import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, BookText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: 'form' | 'navigation' | 'content' | 'accessibility' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  steps: string[];
  exampleCode?: string;
  resources?: { title: string; url: string }[];
}

const bestPractices: BestPractice[] = [
  {
    id: 'bp-1',
    title: 'Form Field Error Handling',
    description: 'Improve form conversion rates by implementing real-time form validation and clear error messages.',
    category: 'form',
    difficulty: 'medium',
    impact: 'high',
    steps: [
      'Validate fields in real-time as users type',
      'Display errors underneath the relevant field',
      'Use color and icons to indicate validation state',
      'Provide clear instructions on how to fix errors',
      'Allow users to submit only when all errors are resolved'
    ],
    exampleCode: `// Real-time validation example
const validateField = (name: string, value: string) => {
  let error = '';
  if (name === 'email') {
    if (!value) {
      error = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
      error = 'Invalid email address';
    }
  }
  return error;
};
`,
    resources: [
      { title: 'Form Design Best Practices', url: 'https://example.com/form-design' },
      { title: 'A11Y Form Guidelines', url: 'https://example.com/a11y-forms' }
    ]
  },
  {
    id: 'bp-2',
    title: 'Navigation Breadcrumbs',
    description: 'Reduce user confusion and back-button usage by implementing clear breadcrumb trails in multi-step processes.',
    category: 'navigation',
    difficulty: 'easy',
    impact: 'medium',
    steps: [
      'Add breadcrumb component to multi-step flows',
      'Highlight current step clearly',
      'Allow users to navigate back to previous steps',
      'Ensure breadcrumbs are responsive on mobile',
      'Include breadcrumbs in deep navigation paths'
    ],
    resources: [
      { title: 'Navigation Patterns', url: 'https://example.com/nav-patterns' }
    ]
  },
  {
    id: 'bp-3',
    title: 'Loading State Management',
    description: 'Prevent user frustration during data loading by implementing appropriate loading states and feedback.',
    category: 'technical',
    difficulty: 'medium',
    impact: 'high',
    steps: [
      'Add skeleton loaders for content areas',
      'Implement progress indicators for long operations',
      'Disable buttons during form submission',
      'Provide estimated time for long operations',
      'Use optimistic UI updates where appropriate'
    ],
    exampleCode: `// Loading state with React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['userData'],
  queryFn: fetchUserData
});

return (
  <div>
    {isLoading ? (
      <SkeletonLoader />
    ) : error ? (
      <ErrorState error={error} />
    ) : (
      <UserData data={data} />
    )}
  </div>
);
`,
    resources: [
      { title: 'UX Loading Patterns', url: 'https://example.com/loading-ux' }
    ]
  },
  {
    id: 'bp-4',
    title: 'Accessible Form Labels',
    description: 'Improve accessibility and user understanding by correctly implementing form labels and descriptions.',
    category: 'accessibility',
    difficulty: 'easy',
    impact: 'high',
    steps: [
      'Use semantic HTML with proper label associations',
      'Add descriptive aria-labels where needed',
      'Include helpful field descriptions',
      'Group related fields with fieldsets',
      'Test with screen readers'
    ],
    exampleCode: `// Accessible form field example
<div className="form-group">
  <label htmlFor="email" id="email-label">Email address</label>
  <p id="email-description" className="text-sm text-muted-foreground">
    We'll never share your email with anyone else.
  </p>
  <input 
    type="email" 
    id="email" 
    aria-labelledby="email-label" 
    aria-describedby="email-description" 
  />
</div>
`,
    resources: [
      { title: 'WCAG Form Guidelines', url: 'https://example.com/wcag-forms' }
    ]
  },
  {
    id: 'bp-5',
    title: 'Content Scannability',
    description: 'Improve engagement and reduce bounce rates by making content easy to scan and digest.',
    category: 'content',
    difficulty: 'easy',
    impact: 'medium',
    steps: [
      'Use clear headings and subheadings',
      'Implement bulleted and numbered lists',
      'Keep paragraphs short and focused',
      'Use appropriate whitespace',
      'Highlight key information with bold or callouts'
    ],
    resources: [
      { title: 'Content Design Patterns', url: 'https://example.com/content-design' }
    ]
  }
];

export const BestPracticeLibrary: React.FC = () => {
  const { toast } = useToast();
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied",
      description: "Example code copied to clipboard",
    });
  };

  const getCategoryColor = (category: BestPractice['category']) => {
    const colors: Record<BestPractice['category'], string> = {
      form: 'bg-blue-100 text-blue-800',
      navigation: 'bg-green-100 text-green-800',
      content: 'bg-purple-100 text-purple-800',
      accessibility: 'bg-amber-100 text-amber-800',
      technical: 'bg-cyan-100 text-cyan-800'
    };
    
    return colors[category];
  };
  
  const getImpactColor = (impact: BestPractice['impact']) => {
    const colors: Record<BestPractice['impact'], string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return colors[impact];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">UX Best Practice Library</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(
          bestPractices.reduce((acc, bp) => {
            if (!acc[bp.category]) acc[bp.category] = 0;
            acc[bp.category]++;
            return acc;
          }, {} as Record<string, number>)
        ).map(([category, count]) => (
          <Card key={category} className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium capitalize">{category}</h3>
                  <p className="text-sm text-muted-foreground">{count} best practices</p>
                </div>
                <div className={`p-2 rounded-full ${getCategoryColor(category as BestPractice['category'])}`}>
                  <BookText className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {bestPractices.map((practice) => (
          <AccordionItem key={practice.id} value={practice.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-col md:flex-row md:items-center gap-2 text-left">
                <span>{practice.title}</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getCategoryColor(practice.category)}>
                    {practice.category}
                  </Badge>
                  <Badge variant="outline" className={getImpactColor(practice.impact)}>
                    {practice.impact} impact
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-2">
                  <CardDescription>{practice.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Implementation Steps</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {practice.steps.map((step, index) => (
                        <li key={index} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  {practice.exampleCode && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Example Implementation</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1"
                          onClick={() => handleCopyCode(practice.exampleCode!)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </Button>
                      </div>
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm">
                        <code>{practice.exampleCode}</code>
                      </pre>
                    </div>
                  )}
                  
                  {practice.resources && practice.resources.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Additional Resources</h4>
                      <ul className="space-y-1">
                        {practice.resources.map((resource, index) => (
                          <li key={index}>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary flex items-center gap-1 hover:underline"
                            >
                              {resource.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
