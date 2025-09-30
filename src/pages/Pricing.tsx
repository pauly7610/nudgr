import React from 'react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
          <h3 className="text-2xl font-bold mb-6">Usage-Based Pricing</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Recordings</CardTitle>
                <CardDescription>Pay only for what you use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">First 1,000 recordings</span>
                    <span className="font-semibold">Included in Pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Additional recordings</span>
                    <span className="font-semibold">$0.10 each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Enterprise</span>
                    <span className="font-semibold">Unlimited</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Storage</CardTitle>
                <CardDescription>Extended retention periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Free: 7 days</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pro: 90 days</span>
                    <span className="font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Enterprise</span>
                    <span className="font-semibold">Custom</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
