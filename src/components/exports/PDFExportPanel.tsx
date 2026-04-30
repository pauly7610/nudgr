import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileDown, Calendar as CalendarIcon, Loader2, Database, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFileStorage } from "@/hooks/useFileStorage";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { useAnalyticsPropertyContext } from "@/contexts/AnalyticsPropertyContext";
import { useCreateExportDestination, useExportCsv, useExportDestinations } from "@/hooks/useGovernance";

const REPORT_TEMPLATES = [
  { id: 'executive-summary', name: 'Executive Summary', sections: ['overview', 'top_friction', 'trends'] },
  { id: 'technical-deep-dive', name: 'Technical Deep Dive', sections: ['errors', 'performance', 'heatmaps'] },
  { id: 'user-journey-analysis', name: 'User Journey Analysis', sections: ['journeys', 'funnels', 'cohorts'] },
];

export const PDFExportPanel = () => {
  const { user } = useAuth();
  const { exportPDF, useExportJobs } = useFileStorage();
  const { data: jobs, isLoading: jobsLoading } = useExportJobs(user?.id || '');
  const { selectedProperty } = useAnalyticsPropertyContext();
  const { data: destinations = [] } = useExportDestinations();
  const createDestination = useCreateExportDestination();
  const exportCsv = useExportCsv();

  const getExportDownloadUrl = (path: string) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;

    const baseUrl = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/exports/${encodeURIComponent(path.replace(/^\/+/, ''))}`;
  };

  const [reportType, setReportType] = useState<string>('executive-summary');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [includeScreenshots, setIncludeScreenshots] = useState(true);
  const [csvType, setCsvType] = useState<'events' | 'errors' | 'performance' | 'taxonomy'>('events');
  const [destinationName, setDestinationName] = useState('');
  const [destinationType, setDestinationType] = useState<'webhook' | 's3' | 'warehouse' | 'email'>('webhook');
  const [destinationTarget, setDestinationTarget] = useState('');

  const handleExport = () => {
    if (!user) return;

    exportPDF.mutate({
      reportType,
      filters: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        includeScreenshots,
      },
      userId: user.id,
    });
  };

  const handleCsvExport = () => {
    exportCsv.mutate({
      exportType: csvType,
      propertyId: selectedProperty?.id ?? null,
      days: 30,
    });
  };

  const handleDestinationCreate = () => {
    if (!destinationName.trim()) return;

    createDestination.mutate(
      {
        name: destinationName,
        destinationType,
        cadence: 'weekly',
        config: { target: destinationTarget },
        isActive: true,
      },
      {
        onSuccess: () => {
          setDestinationName('');
          setDestinationTarget('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>
            Generate comprehensive PDF reports with custom templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Report Template</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TEMPLATES.map((tmpl) => (
                  <SelectItem key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="screenshots"
              checked={includeScreenshots}
              onCheckedChange={(checked) => setIncludeScreenshots(checked as boolean)}
            />
            <label htmlFor="screenshots" className="text-sm font-medium cursor-pointer">
              Include screenshots
            </label>
          </div>

          <Button onClick={handleExport} disabled={exportPDF.isPending || !startDate || !endDate} className="w-full">
            {exportPDF.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Generate PDF Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Exports
          </CardTitle>
          <CardDescription>
            Generate CSV datasets now or configure scheduled destinations for warehouse and BI workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label>CSV dataset</Label>
              <Select value={csvType} onValueChange={(value) => setCsvType(value as typeof csvType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="errors">Errors</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="taxonomy">Event taxonomy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCsvExport} disabled={exportCsv.isPending}>
              {exportCsv.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Export CSV
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr_1fr_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="destination-name">Destination name</Label>
              <Input id="destination-name" value={destinationName} onChange={(event) => setDestinationName(event.target.value)} placeholder="Analytics warehouse" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={destinationType} onValueChange={(value) => setDestinationType(value as typeof destinationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="s3">S3</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-target">Target</Label>
              <Input id="destination-target" value={destinationTarget} onChange={(event) => setDestinationTarget(event.target.value)} placeholder="https://hooks.example.com/dreamfi" />
            </div>
            <Button variant="outline" onClick={handleDestinationCreate} disabled={createDestination.isPending}>
              {createDestination.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>

          <div className="rounded-md border">
            {destinations.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No scheduled destinations yet.</div>
            ) : (
              destinations.map((destination) => (
                <div key={destination.id} className="flex items-center justify-between border-b p-3 text-sm last:border-b-0">
                  <div>
                    <div className="font-medium">{destination.name}</div>
                    <div className="text-xs text-muted-foreground">{destination.destinationType} - {destination.cadence}</div>
                  </div>
                  <span className={cn("rounded px-2 py-1 text-xs", destination.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                    {destination.isActive ? 'active' : 'paused'}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading exports...
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-2">
              {jobs.slice(0, 10).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{job.export_type?.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(job.created_at), 'PPP')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-2 py-1 rounded", job.status === 'completed' && "bg-green-100 text-green-700")}>
                      {job.status}
                    </span>
                    {job.status === 'completed' && job.storage_path && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getExportDownloadUrl(job.storage_path || ''), '_blank')}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No exports yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
