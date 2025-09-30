import React from 'react';
import { Lock, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  feature: string;
  requiredTier: SubscriptionTier;
  description?: string;
}

const TIER_INFO = {
  professional: {
    icon: Zap,
    name: 'Professional',
    price: '$99/month',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  enterprise: {
    icon: Crown,
    name: 'Enterprise',
    price: '$299/month',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  requiredTier, 
  description 
}) => {
  const { tier } = useSubscription();
  const tierInfo = TIER_INFO[requiredTier as keyof typeof TIER_INFO];
  
  if (!tierInfo) return null;

  const Icon = tierInfo.icon;

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${tierInfo.bgColor}`}>
              <Lock className={`h-5 w-5 ${tierInfo.color}`} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {feature}
                <Badge variant="outline" className={tierInfo.color}>
                  <Icon className="h-3 w-3 mr-1" />
                  {tierInfo.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                {description || `Upgrade to ${tierInfo.name} to unlock this feature`}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="lg">
          Upgrade to {tierInfo.name} - {tierInfo.price}
        </Button>
      </CardContent>
    </Card>
  );
};
