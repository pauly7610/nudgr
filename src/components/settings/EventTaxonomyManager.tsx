import { FormEvent, useMemo, useState } from 'react';
import { BookOpenCheck, Loader2, Plus, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { useCollectionObservability, useCreateEventDefinition, useEventDefinitions } from '@/hooks/useGovernance';

export const EventTaxonomyManager = () => {
  const { selectedProperty } = useAnalyticsPropertyContext();
  const propertyId = selectedProperty?.id ?? null;
  const { data: definitions = [], isLoading } = useEventDefinitions(propertyId);
  const { data: observability } = useCollectionObservability(propertyId, 24);
  const createDefinition = useCreateEventDefinition(propertyId);
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('activation');
  const [requiredProperties, setRequiredProperties] = useState('');
  const [conversionEvent, setConversionEvent] = useState(false);
  const [piiRisk, setPiiRisk] = useState<'low' | 'medium' | 'high'>('low');

  const conversionCount = useMemo(
    () => definitions.filter((definition) => definition.conversionEvent).length,
    [definitions]
  );

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createDefinition.mutate(
      {
        eventName,
        category,
        requiredProperties: requiredProperties.split(',').map((item) => item.trim()).filter(Boolean),
        optionalProperties: [],
        conversionEvent,
        piiRisk,
        status: 'active',
      },
      {
        onSuccess: () => {
          setEventName('');
          setRequiredProperties('');
          setConversionEvent(false);
          setPiiRisk('low');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5" />
              Event Taxonomy
            </CardTitle>
            <CardDescription>
              Define the product events DreamFi should expect, validate, and use in funnels.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{definitions.length} events</Badge>
            <Badge variant="secondary">{conversionCount} conversions</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr_auto] lg:items-end" onSubmit={handleCreate}>
          <div className="space-y-2">
            <Label htmlFor="event-name">Event name</Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
              placeholder="loan_application_submitted"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activation">Activation</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="required-props">Required properties</Label>
            <Input
              id="required-props"
              value={requiredProperties}
              onChange={(event) => setRequiredProperties(event.target.value)}
              placeholder="plan, source"
            />
          </div>
          <Button type="submit" disabled={createDefinition.isPending}>
            {createDefinition.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add
          </Button>
        </form>

        <div className="flex flex-wrap gap-4 rounded-md border p-3">
          <div className="flex items-center gap-2">
            <Switch checked={conversionEvent} onCheckedChange={setConversionEvent} id="conversion-event" />
            <Label htmlFor="conversion-event" className="text-sm">Conversion event</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">PII risk</Label>
            <Select value={piiRisk} onValueChange={(value) => setPiiRisk(value as 'low' | 'medium' | 'high')}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {observability?.unknownEvents && observability.unknownEvents.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-medium text-amber-900">Unknown events arriving</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {observability.unknownEvents.slice(0, 8).map((event) => (
                <Badge key={event.eventType} variant="outline" className="border-amber-300 bg-white">
                  {event.eventType} ({event.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-md border">
          {isLoading ? (
            <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading taxonomy...
            </div>
          ) : definitions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Start with the events your boss will care about: started, completed, failed, upgraded, and contacted support.
            </div>
          ) : (
            definitions.map((definition) => (
              <div key={definition.id} className="grid gap-3 border-b p-3 last:border-b-0 md:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{definition.eventName}</span>
                    {definition.conversionEvent && (
                      <Badge>
                        <Target className="mr-1 h-3 w-3" />
                        Conversion
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {definition.category} - required: {definition.requiredProperties.length > 0 ? definition.requiredProperties.join(', ') : 'none'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge variant="outline">{definition.status}</Badge>
                  <Badge variant={definition.piiRisk === 'high' ? 'destructive' : 'secondary'}>{definition.piiRisk} PII</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
