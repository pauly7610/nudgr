import { Link } from 'react-router-dom';
import { CheckCircle2, Globe2, Plus, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_PROPERTIES_ID, useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { cn } from '@/lib/utils';

const statusLabel = (status: string) => {
  return status === 'connected' ? 'Live' : 'Waiting';
};

export const PropertySelector = () => {
  const {
    properties,
    selectedPropertyId,
    selectedProperty,
    setSelectedPropertyId,
    isLoading,
  } = useAnalyticsPropertyContext();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Select
        value={selectedPropertyId}
        onValueChange={setSelectedPropertyId}
        disabled={isLoading}
      >
        <SelectTrigger className="h-9 w-[220px] max-w-[52vw]">
          <div className="flex min-w-0 items-center gap-2">
            <Globe2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue placeholder={isLoading ? 'Loading sites' : 'All properties'} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_PROPERTIES_ID}>All properties</SelectItem>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <span className="truncate">{property.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Badge
        variant={selectedProperty?.status === 'connected' ? 'default' : 'secondary'}
        className={cn('hidden h-9 items-center gap-1 whitespace-nowrap sm:flex')}
      >
        {selectedProperty?.status === 'connected' ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Signal className="h-3.5 w-3.5" />
        )}
        {selectedProperty ? statusLabel(selectedProperty.status) : `${properties.length} total`}
      </Badge>

      <Button asChild variant="outline" size="sm" className="h-9 shrink-0">
        <Link to="/connect">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Connect</span>
        </Link>
      </Button>
    </div>
  );
};
