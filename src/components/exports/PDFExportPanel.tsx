import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileDown, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFileStorage } from "@/hooks/useFileStorage";
import { useAuth } from "@/hooks/useAuth";

export const PDFExportPanel = () => {
  const { user } = useAuth();
  const { exportPDF, useExportJobs } = useFileStorage();
  const { data: jobs, isLoading: jobsLoading } = useExportJobs(user?.id || '');

  const [reportType, setReportType] = useState<string>('friction_summary');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleExport = () => {
    if (!user) return;

    exportPDF.mutate({
      reportType,
      filters: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
      userId: user.id,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>
            Generate PDF reports of your friction analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friction_summary">Friction Summary</SelectItem>
                <SelectItem value="journey_analysis">Journey Analysis</SelectItem>
                <SelectItem value="cohort_comparison">Cohort Comparison</SelectItem>
                <SelectItem value="element_analytics">Element Analytics</SelectItem>
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
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={exportPDF.isPending || !startDate || !endDate}
            className="w-full"
          >
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
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>
            Download your previously generated reports
          </CardDescription>
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
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{job.export_type?.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(job.created_at), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      job.status === 'completed' && "bg-green-100 text-green-700",
                      job.status === 'processing' && "bg-yellow-100 text-yellow-700",
                      job.status === 'failed' && "bg-red-100 text-red-700"
                    )}>
                      {job.status}
                    </span>
                    {job.status === 'completed' && job.storage_path && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Construct download URL from storage path
                          window.open(`https://nykvaozegqidulsgqrfg.supabase.co/storage/v1/object/public/pdf-exports/${job.storage_path}`, '_blank');
                        }}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No exports yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};