import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Database, Loader2, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';

export const SampleDataGenerator = () => {
  const [dataType, setDataType] = useState('friction_events');
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState(false);

  const generateSampleData = async () => {
    setLoading(true);
    try {
      const user = await apiRequest<{ id: string }>('/auth/me');

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
      type: ['click', 'scroll', 'form_error', 'page_load'][Math.floor(Math.random() * 4)],
      eventId: `sample-${i + 1}`,
      timestamp: Date.now(),
      session_id: `session-${Math.floor(Math.random() * 20) + 1}`,
      data: {
        eventType: ['click', 'scroll', 'form_error', 'page_load'][Math.floor(Math.random() * 4)],
        pageUrl: `/page-${Math.floor(Math.random() * 5) + 1}`,
        elementSelector: `#element-${Math.floor(Math.random() * 10) + 1}`,
        severityScore: Math.floor(Math.random() * 10),
        sample: true,
        index: i,
        userId,
      },
    }));

    await apiRequest<{ ok: boolean; accepted: number }>('/api/ingest-events', {
      method: 'POST',
      body: JSON.stringify({ events: events.map((event) => ({
        ...event,
        sessionId: event.session_id,
      })) }),
    });
  };

  const generateHeatmapData = async () => {
    const pages = Array.from({ length: 5 }, (_, i) => `/page-${i + 1}`);
    const elements = Array.from({ length: 10 }, (_, i) => `#element-${i + 1}`);
    
    const heatmaps: Array<Record<string, unknown>> = [];
    for (let i = 0; i < count; i++) {
      heatmaps.push({
        type: 'heatmap_interaction',
        sessionId: `session-${Math.floor(Math.random() * 20) + 1}`,
        timestamp: Date.now(),
        data: {
          eventType: 'heatmap_interaction',
          pageUrl: pages[Math.floor(Math.random() * pages.length)],
          elementSelector: elements[Math.floor(Math.random() * elements.length)],
          interactionType: ['click', 'hover', 'scroll'][Math.floor(Math.random() * 3)],
          severityScore: Math.floor(Math.random() * 10),
          interactionCount: Math.floor(Math.random() * 1000) + 1,
          dateBucket: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      });
    }

    await apiRequest<{ ok: boolean; accepted: number }>('/api/ingest-events', {
      method: 'POST',
      body: JSON.stringify({ events: heatmaps }),
    });
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
