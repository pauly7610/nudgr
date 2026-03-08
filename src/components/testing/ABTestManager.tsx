import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface ABTest {
  id: string;
  name: string;
  description?: string;
  variants: { id: string; name: string; weight: number }[];
  is_active: boolean;
}

interface ABTestApi {
  id: string;
  name: string;
  description?: string;
  variants: { id: string; name: string; weight: number }[];
  isActive: boolean;
}

interface BayesianSummary {
  abTestId: string;
  winnerVariantId: string;
  winnerProbability: number;
  variants: {
    id: string;
    name: string;
    posteriorMean: number;
  }[];
}

const toUiModel = (test: ABTestApi): ABTest => ({
  id: test.id,
  name: test.name,
  description: test.description,
  variants: test.variants,
  is_active: test.isActive,
});

export const ABTestManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [variants, setVariants] = useState([
    { id: 'control', name: 'Control', weight: 50 },
    { id: 'variant-a', name: 'Variant A', weight: 50 },
  ]);

  const { data: tests } = useQuery({
    queryKey: ['ab-tests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        const data = await apiRequest<ABTestApi[]>('/ab-tests');
        return data.map(toUiModel);
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const { data: bayesianSummaries } = useQuery({
    queryKey: ['ab-tests-bayesian', tests?.map((test) => test.id).join(','), user?.id],
    queryFn: async () => {
      if (!tests || tests.length === 0) {
        return {} as Record<string, BayesianSummary>;
      }

      const summaries = await Promise.all(
        tests.map(async (test) => {
          try {
            const summary = await apiRequest<BayesianSummary>(`/ab-tests/${test.id}/bayesian-summary`);
            return [test.id, summary] as const;
          } catch {
            return [test.id, null] as const;
          }
        })
      );

      return Object.fromEntries(summaries.filter((entry): entry is readonly [string, BayesianSummary] => Boolean(entry[1])));
    },
    enabled: Boolean(user?.id && tests && tests.length > 0),
  });

  const createTest = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const data = await apiRequest<ABTestApi>('/ab-tests', {
        method: 'POST',
        body: JSON.stringify({
          name: testName,
          description: testDescription,
          variants,
          isActive: true,
        }),
      });

      return toUiModel(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({ title: 'A/B test created', description: 'Your test is now active' });
      setTestName('');
      setTestDescription('');
      setVariants([
        { id: 'control', name: 'Control', weight: 50 },
        { id: 'variant-a', name: 'Variant A', weight: 50 },
      ]);
    },
    onError: (error) => {
      toast({ title: 'Failed to create test', description: error.message, variant: 'destructive' });
    },
  });

  const toggleTest = useMutation({
    mutationFn: async ({ testId, isActive }: { testId: string; isActive: boolean }) => {
      await apiRequest<{ ok: true }>(`/ab-tests/${testId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });

  const addVariant = () => {
    const newId = `variant-${String.fromCharCode(65 + variants.length - 1)}`.toLowerCase();
    setVariants([...variants, { id: newId, name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`, weight: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariantWeight = (index: number, weight: number) => {
    const newVariants = [...variants];
    newVariants[index].weight = weight;
    setVariants(newVariants);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Create A/B Test
          </CardTitle>
          <CardDescription>
            Compare friction between different variants of your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-name">Test Name</Label>
            <Input
              id="test-name"
              placeholder="e.g., Checkout Button Color Test"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-description">Description (Optional)</Label>
            <Textarea
              id="test-description"
              placeholder="Describe what you're testing..."
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Variants</Label>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <div key={variant.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Input
                  placeholder="Variant name"
                  value={variant.name}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].name = e.target.value;
                    setVariants(newVariants);
                  }}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={variant.weight}
                    onChange={(e) => updateVariantWeight(index, parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                {variants.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={() => createTest.mutate()}
            disabled={!testName || createTest.isPending}
            className="w-full"
          >
            Create Test
          </Button>
        </CardContent>
      </Card>

      {/* Active Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {tests && tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{test.name}</h4>
                      <Badge variant={test.is_active ? 'default' : 'secondary'}>
                        {test.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    {test.description && (
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    )}
                    <div className="flex gap-2">
                      {test.variants.map((v) => (
                        <Badge key={v.id} variant="outline">
                          {v.name}: {v.weight}%
                        </Badge>
                      ))}
                    </div>
                    {bayesianSummaries?.[test.id] && (
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Bayesian winner probability:{' '}
                          <span className="font-medium text-foreground">
                            {Math.round(bayesianSummaries[test.id].winnerProbability * 100)}%
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {bayesianSummaries[test.id].variants.map((variant) => (
                            <Badge key={variant.id} variant={variant.id === bayesianSummaries[test.id].winnerVariantId ? 'default' : 'secondary'}>
                              {variant.name}: {(variant.posteriorMean * 100).toFixed(1)}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTest.mutate({ testId: test.id, isActive: !test.is_active })}
                  >
                    {test.is_active ? 'Pause' : 'Resume'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No tests created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
