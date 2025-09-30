import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      metadata: any 
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('userId', userId);
      formData.append('metadata', JSON.stringify(metadata));

      const { data, error } = await supabase.functions.invoke('upload-recording', {
        body: formData,
      });

      if (error) throw error;
      return data;
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

      const { data, error } = await supabase.functions.invoke('upload-screenshot', {
        body: formData,
      });

      if (error) throw error;
      return data;
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
      filters: any; 
      userId: string 
    }) => {
      const { data, error } = await supabase.functions.invoke('export-pdf', {
        body: { reportType, filters, userId },
      });

      if (error) throw error;
      return data;
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
        const { data, error } = await supabase
          .from('session_recordings')
          .select('*')
          .order('recording_start', { ascending: false });

        if (error) throw error;
        return data;
      },
    });
  };

  const useExportJobs = (userId: string) => {
    return useQuery({
      queryKey: ['export-jobs', userId],
      queryFn: async () => {
        if (!userId) return [];
        const { data, error } = await supabase
          .from('export_jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
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