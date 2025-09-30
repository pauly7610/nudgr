import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface ABTest {
  id: string;
  name: string;
  description?: string;
  variants: { id: string; name: string; weight: number }[];
  is_active: boolean;
}

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
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(test => ({
        ...test,
        variants: test.variants as unknown as { id: string; name: string; weight: number }[]
      })) as ABTest[];
    },
    enabled: !!user?.id,
  });

  const createTest = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('ab_tests')
        .insert([{
          user_id: user.id,
          name: testName,
          description: testDescription,
          variants: variants,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('ab_tests')
        .update({ is_active: isActive })
        .eq('id', testId);

      if (error) throw error;
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
                      {test.variants.map((v: any) => (
                        <Badge key={v.id} variant="outline">
                          {v.name}: {v.weight}%
                        </Badge>
                      ))}
                    </div>
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
