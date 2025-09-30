import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Database, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const SampleDataGenerator = () => {
  const [dataType, setDataType] = useState('friction_events');
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState(false);

  const generateSampleData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      switch (dataType) {
        case 'friction_events':
          await generateFrictionEvents(user.id);
          break;
        case 'heatmap_data':
          await generateHeatmapData();
          break;
      }

      toast({
        title: 'Sample data generated',
        description: `Successfully created ${count} sample ${dataType}`,
      });
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate sample data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFrictionEvents = async (userId: string) => {
    const events = Array.from({ length: count }, (_, i) => ({
      event_type: ['click', 'scroll', 'form_error', 'page_load'][Math.floor(Math.random() * 4)],
      page_url: `/page-${Math.floor(Math.random() * 5) + 1}`,
      element_selector: `#element-${Math.floor(Math.random() * 10) + 1}`,
      severity_score: Math.floor(Math.random() * 100),
      session_id: `session-${Math.floor(Math.random() * 20) + 1}`,
      metadata: { sample: true, index: i, user_id: userId },
    }));

    await supabase.from('friction_events').insert(events);
  };

  const generateHeatmapData = async () => {
    const pages = Array.from({ length: 5 }, (_, i) => `/page-${i + 1}`);
    const elements = Array.from({ length: 10 }, (_, i) => `#element-${i + 1}`);
    
    const heatmaps = [];
    for (let i = 0; i < count; i++) {
      heatmaps.push({
        page_url: pages[Math.floor(Math.random() * pages.length)],
        element_selector: elements[Math.floor(Math.random() * elements.length)],
        interaction_type: ['click', 'hover', 'scroll'][Math.floor(Math.random() * 3)],
        friction_score: Math.floor(Math.random() * 100),
        interaction_count: Math.floor(Math.random() * 1000) + 1,
        date_bucket: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }

    await supabase.from('heatmap_data').insert(heatmaps);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Sample Data Generator</CardTitle>
        </div>
        <CardDescription>
          Generate sample data for testing and demos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Data Type</Label>
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friction_events">Friction Events</SelectItem>
              <SelectItem value="heatmap_data">Heatmap Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Number of Records</Label>
          <Input
            type="number"
            min="1"
            max="1000"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 50)}
          />
        </div>

        <Button
          onClick={generateSampleData}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Generate Sample Data
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          This will create {count} sample {dataType.replace('_', ' ')} records in your database
        </p>
      </CardContent>
    </Card>
  );
};
