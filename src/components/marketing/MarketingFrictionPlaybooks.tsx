
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  BookText, 
  Filter, 
  Download, 
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

interface MarketingPlaybook {
  id: string;
  title: string;
  description: string;
  category: 'landing_page' | 'checkout' | 'signup' | 'onboarding' | 'product';
  frictionType: 'form_abandonment' | 'rage_clicks' | 'navigation_loops' | 'excessive_scrolling';
  conversionLift: number;
  implementationTime: 'quick' | 'medium' | 'complex';
  steps: {
    title: string;
    description: string;
    status?: 'success' | 'warning' | 'info';
  }[];
  beforeAfterData?: {
    before: { name: string; value: number }[];
    after: { name: string; value: number }[];
  };
  relatedCases?: {
    company: string;
    industry: string;
    outcome: string;
  }[];
}

const marketingPlaybooks: MarketingPlaybook[] = [
  {
    id: 'playbook-1',
    title: 'Form Simplification Strategy',
    description: 'Reduce form abandonment by simplifying the signup process and minimizing required fields.',
    category: 'signup',
    frictionType: 'form_abandonment',
    conversionLift: 23,
    implementationTime: 'quick',
    steps: [
      {
        title: 'Audit current form fields',
        description: 'Identify which fields are absolutely necessary vs. nice to have.',
        status: 'success'
      },
      {
        title: 'Implement progressive disclosure',
        description: 'Only show additional fields after core information is collected.',
        status: 'warning'
      },
      {
        title: 'Add inline validation',
        description: 'Validate fields as users type to prevent submission errors.',
        status: 'info'
      },
      {
        title: 'Implement social sign-up',
        description: 'Allow users to sign up with existing social accounts.',
      },
      {
        title: 'A/B test variations',
        description: 'Test different form layouts and field counts.',
      }
    ],
    beforeAfterData: {
      before: [
        { name: 'Visit', value: 100 },
        { name: 'Start', value: 72 },
        { name: 'Fill Name', value: 58 },
        { name: 'Fill Email', value: 47 },
        { name: 'Fill Password', value: 38 },
        { name: 'Fill Details', value: 26 },
        { name: 'Submit', value: 21 }
      ],
      after: [
        { name: 'Visit', value: 100 },
        { name: 'Start', value: 85 },
        { name: 'Fill Email', value: 74 },
        { name: 'Fill Password', value: 62 },
        { name: 'Submit', value: 54 }
      ]
    },
    relatedCases: [
      {
        company: 'TechStream',
        industry: 'SaaS',
        outcome: '28% increase in sign-up completions'
      },
      {
        company: 'ShopQuick',
        industry: 'E-commerce',
        outcome: '18% reduction in cart abandonment'
      }
    ]
  },
  {
    id: 'playbook-2',
    title: 'Landing Page Clarity Framework',
    description: 'Reduce bounce rates and rage clicks by implementing a clear value proposition and CTA structure.',
    category: 'landing_page',
    frictionType: 'rage_clicks',
    conversionLift: 18,
    implementationTime: 'medium',
    steps: [
      {
        title: 'Rewrite headline for clarity',
        description: 'Create a benefit-focused headline that immediately communicates value.',
        status: 'success'
      },
      {
        title: 'Simplify page navigation',
        description: 'Remove unnecessary menu items and focus on primary actions.',
        status: 'success'
      },
      {
        title: 'Enhance CTA visibility',
        description: 'Make CTAs stand out with contrasting colors and clear action text.',
        status: 'warning'
      },
      {
        title: 'Add social proof elements',
        description: 'Include testimonials, logos, or statistics to build credibility.',
      },
      {
        title: 'Optimize visual hierarchy',
        description: 'Ensure the most important elements get the most visual attention.',
      }
    ],
    beforeAfterData: {
      before: [
        { name: 'Visit', value: 100 },
        { name: 'Scroll', value: 65 },
        { name: 'CTA View', value: 48 },
        { name: 'CTA Click', value: 22 }
      ],
      after: [
        { name: 'Visit', value: 100 },
        { name: 'Scroll', value: 82 },
        { name: 'CTA View', value: 76 },
        { name: 'CTA Click', value: 41 }
      ]
    }
  },
  {
    id: 'playbook-3',
    title: 'Checkout Optimization Protocol',
    description: 'Increase checkout completion rates by streamlining the purchase process and reducing abandonment.',
    category: 'checkout',
    frictionType: 'navigation_loops',
    conversionLift: 31,
    implementationTime: 'complex',
    steps: [
      {
        title: 'Implement guest checkout option',
        description: 'Allow purchases without requiring account creation.',
        status: 'success'
      },
      {
        title: 'Add progress indicator',
        description: 'Show users where they are in the checkout process.',
        status: 'success'
      },
      {
        title: 'Optimize for mobile',
        description: 'Ensure the checkout flow works seamlessly on mobile devices.',
        status: 'warning'
      },
      {
        title: 'Add multiple payment options',
        description: 'Offer various payment methods including digital wallets.',
        status: 'info'
      },
      {
        title: 'Implement cart recovery',
        description: 'Add email reminders for abandoned carts.',
      }
    ],
    relatedCases: [
      {
        company: 'FashionNova',
        industry: 'Retail',
        outcome: '27% increase in checkout completion'
      },
      {
        company: 'GadgetWorld',
        industry: 'Electronics',
        outcome: '34% reduction in cart abandonment'
      }
    ]
  }
];

export const MarketingFrictionPlaybooks: React.FC = () => {
  const [activePlaybook, setActivePlaybook] = useState<MarketingPlaybook | null>(null);
  const { toast } = useToast();
  
  const handleExport = () => {
    toast({
      title: "Playbook exported",
      description: "The playbook has been exported to PDF format",
    });
  };
  
  const getCategoryBadgeStyle = (category: MarketingPlaybook['category']) => {
    const styles: Record<MarketingPlaybook['category'], string> = {
      landing_page: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      checkout: 'bg-green-100 text-green-800 hover:bg-green-200',
      signup: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      onboarding: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      product: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
    };
    
    return styles[category];
  };
  
  const getImplementationStyle = (time: MarketingPlaybook['implementationTime']) => {
    const styles: Record<MarketingPlaybook['implementationTime'], string> = {
      quick: 'text-green-700',
      medium: 'text-amber-700',
      complex: 'text-red-700'
    };
    
    return styles[time];
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Marketing Friction Playbooks</h2>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="landing_page">Landing Pages</TabsTrigger>
          <TabsTrigger value="signup">Sign-up</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketingPlaybooks.map((playbook) => (
              <Card key={playbook.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={getCategoryBadgeStyle(playbook.category)}>
                      {playbook.category.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      +{playbook.conversionLift}% lift
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">{playbook.title}</CardTitle>
                  <CardDescription>{playbook.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Implementation complexity:</p>
                      <p className={`font-medium ${getImplementationStyle(playbook.implementationTime)}`}>
                        {playbook.implementationTime.charAt(0).toUpperCase() + playbook.implementationTime.slice(1)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Key friction addressed:</p>
                      <p className="font-medium">
                        {playbook.frictionType.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="default" 
                            className="w-full"
                            onClick={() => setActivePlaybook(playbook)}
                          >
                            View Playbook
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle>{activePlaybook?.title}</SheetTitle>
                          </SheetHeader>
                          
                          {activePlaybook && (
                            <div className="py-6 space-y-6">
                              <div>
                                <h3 className="font-medium mb-2">Playbook Overview</h3>
                                <p className="text-muted-foreground">{activePlaybook.description}</p>
                              </div>
                              
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="font-medium">Implementation Steps</h3>
                                  <Badge variant="outline">
                                    {activePlaybook.steps.filter(s => s.status === 'success').length}/{activePlaybook.steps.length} complete
                                  </Badge>
                                </div>
                                
                                <div className="space-y-3">
                                  {activePlaybook.steps.map((step, index) => (
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
                              
                              {activePlaybook.beforeAfterData && (
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
                                          data={activePlaybook.beforeAfterData.before} 
                                          type="monotone" 
                                          dataKey="value" 
                                          stroke="#9f7aea" 
                                          strokeWidth={2}
                                          dot={{ r: 4 }}
                                          activeDot={{ r: 6 }}
                                        />
                                        <Line 
                                          name="After"
                                          data={activePlaybook.beforeAfterData.after} 
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
                              
                              {activePlaybook.relatedCases && activePlaybook.relatedCases.length > 0 && (
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
                                      {activePlaybook.relatedCases.map((caseStudy, index) => (
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
                          )}
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {['landing_page', 'signup', 'checkout', 'onboarding'].map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketingPlaybooks
                .filter(p => p.category === category)
                .map((playbook) => (
                  <Card key={playbook.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className={getCategoryBadgeStyle(playbook.category)}>
                          {playbook.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          +{playbook.conversionLift}% lift
                        </Badge>
                      </div>
                      <CardTitle className="mt-2">{playbook.title}</CardTitle>
                      <CardDescription>{playbook.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Implementation complexity:</p>
                          <p className={`font-medium ${getImplementationStyle(playbook.implementationTime)}`}>
                            {playbook.implementationTime.charAt(0).toUpperCase() + playbook.implementationTime.slice(1)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Key friction addressed:</p>
                          <p className="font-medium">
                            {playbook.frictionType.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </p>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            variant="default" 
                            className="w-full"
                            onClick={() => setActivePlaybook(playbook)}
                          >
                            View Playbook
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Marketing Pattern Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Friction Types by Marketing Source</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Google Ads', rageClicks: 25, formAbandonment: 40, navigationLoops: 15 },
                    { name: 'Facebook', rageClicks: 35, formAbandonment: 20, navigationLoops: 10 },
                    { name: 'Direct', rageClicks: 15, formAbandonment: 25, navigationLoops: 30 },
                    { name: 'Email', rageClicks: 10, formAbandonment: 30, navigationLoops: 5 }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="rageClicks" name="Rage Clicks" fill="#8884d8" />
                  <Bar dataKey="formAbandonment" name="Form Abandonment" fill="#82ca9d" />
                  <Bar dataKey="navigationLoops" name="Navigation Loops" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Conversion Lift by Implementation Strategy</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Form Simplification', lift: 23 },
                    { name: 'Clear CTAs', lift: 18 },
                    { name: 'Progress Indicators', lift: 12 },
                    { name: 'Social Proof', lift: 15 },
                    { name: 'Guest Checkout', lift: 31 }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 'dataMax + 5']} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <RechartsTooltip formatter={(value) => [`${value}% lift`, 'Conversion Improvement']} />
                  <Bar dataKey="lift" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Need a Custom Playbook?</CardTitle>
          <CardDescription>
            Our team can create a custom marketing friction playbook tailored to your specific challenges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full flex items-center justify-center gap-1">
            Request Custom Playbook <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
