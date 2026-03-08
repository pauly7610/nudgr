import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/apiClient";

interface FileStoragePayload {
  file: File;
  sessionId?: string;
  eventId?: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface RecordingSummary {
  id: string;
  session_id: string;
  storage_path: string;
  recording_start: string;
  duration_seconds: number;
  friction_events_count: number;
  metadata?: Record<string, unknown> | null;
}

export interface ExportJob {
  id: string;
  export_type: string;
  created_at: string;
  status: string;
  storage_path?: string | null;
}

export const useFileStorage = () => {
  const uploadRecording = useMutation({
    mutationFn: async ({ 
      file, 
      sessionId, 
      userId, 
      metadata 
    }: { 
      file: File; 
      sessionId: string; 
      userId: string; 
      metadata: Record<string, unknown> 
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('userId', userId);
      formData.append('metadata', JSON.stringify(metadata));

      return apiRequest<{ ok: boolean; message?: string; recordingUrl?: string }>('/api/upload-recording', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Recording uploaded",
        description: "Session recording saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadScreenshot = useMutation({
    mutationFn: async ({ 
      file, 
      eventId, 
      userId 
    }: { 
      file: File; 
      eventId?: string; 
      userId: string 
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (eventId) formData.append('eventId', eventId);
      formData.append('userId', userId);

      return apiRequest<{ ok: boolean; message?: string; screenshotUrl?: string }>('/api/upload-screenshot', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Screenshot uploaded",
        description: "Friction screenshot saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportPDF = useMutation({
    mutationFn: async ({ 
      reportType, 
      filters, 
      userId 
    }: { 
      reportType: string; 
      filters: Record<string, unknown>; 
      userId: string 
    }) => {
      return apiRequest<{ downloadUrl?: string; ok?: boolean }>('/api/export-pdf', {
        method: 'POST',
        body: JSON.stringify({ reportType, filters, userId }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "PDF generated",
        description: "Your report is ready for download",
      });
      // Open download URL
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const useRecordings = (userId: string) => {
    return useQuery({
      queryKey: ['recordings', userId],
      queryFn: async () => {
        if (!userId) return [];

        try {
          return await apiRequest<RecordingSummary[]>(`/recordings?userId=${encodeURIComponent(userId)}`);
        } catch {
          return [];
        }
      },
    });
  };

  const useExportJobs = (userId: string) => {
    return useQuery({
      queryKey: ['export-jobs', userId],
      queryFn: async () => {
        if (!userId) return [];

        try {
          return await apiRequest<ExportJob[]>(`/export-jobs?userId=${encodeURIComponent(userId)}`);
        } catch {
          return [];
        }
      },
    });
  };

  return {
    uploadRecording,
    uploadScreenshot,
    exportPDF,
    useRecordings,
    useExportJobs,
  };
};