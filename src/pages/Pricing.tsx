import React from 'react';
import { Check, Zap, Crown, Sparkles, Video, Database, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useSubscription } from '@/hooks/useSubscription';

const PRICING_TIERS = [
  {
    name: 'Free',
    tier: 'free',
    price: '$0',
    description: 'Perfect for small teams getting started',
    icon: Sparkles,
    features: [
      'Basic friction tracking',
      'Up to 1,000 events/month',
      'Basic dashboard',
      'Email alerts',
      '7-day data retention',
      'Community support',
    ],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'Professional',
    tier: 'professional',
    price: '$99',
    description: 'Advanced analytics for growing teams',
    icon: Zap,
    features: [
      'Everything in Free, plus:',
      'Unlimited events',
      'AI-powered analysis',
      'Advanced analytics & heatmaps',
      'Cohort analysis',
      'Session recordings (1,000/month)',
      'A/B testing',
      '90-day data retention',
      'Priority support',
    ],
    cta: 'Upgrade to Professional',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    tier: 'enterprise',
    price: '$299',
    description: 'Custom solutions for large organizations',
    icon: Crown,
    features: [
      'Everything in Professional, plus:',
      'White-labeling',
      'Custom integrations',
      'API access',
      'Team collaboration',
      'Unlimited session recordings',
      'Custom data retention',
      'Advanced security',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Upgrade to Enterprise',
    highlighted: false,
  },
];

const Pricing = () => {
  const { tier: currentTier } = useSubscription();

  return (
    <>
      <DashboardHeader
        title="Pricing Plans"
        description="Choose the perfect plan for your team"
      />

      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrentPlan = currentTier === tier.tier;

            return (
              <Card 
                key={tier.tier}
                className={`relative ${tier.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-6 w-6 ${tier.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                    <CardTitle>{tier.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.tier !== 'free' && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full"
                    variant={tier.highlighted ? 'default' : 'outline'}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">Usage-Based Pricing</h3>
          <p className="text-muted-foreground mb-6">
            Pay only for what you use beyond your plan limits. No surprises.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Session Recordings
                </CardTitle>
                <CardDescription>Metered billing for recordings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Free Tier</span>
                      <Badge variant="outline">100 recordings/month</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Hard limit - no overage</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Professional</span>
                      <Badge variant="outline">1,000 included</Badge>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Additional recordings</span>
                      <span className="font-semibold">$0.10 each</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Enterprise</span>
                      <Badge>Unlimited</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Storage
                </CardTitle>
                <CardDescription>Flexible storage pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Free Tier</span>
                      <Badge variant="outline">1 GB included</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">7-day retention</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Professional</span>
                      <Badge variant="outline">10 GB included</Badge>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Additional storage</span>
                      <span className="font-semibold">$0.05/GB</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">90-day retention</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Enterprise</span>
                      <Badge variant="outline">100 GB included</Badge>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Additional storage</span>
                      <span className="font-semibold">$0.02/GB</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Custom retention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-6">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Transparent Billing:</strong> Track your usage in real-time from the Settings page. 
              You'll receive alerts when approaching your limits, and overage charges are calculated monthly.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </>
  );
};

export default Pricing;
