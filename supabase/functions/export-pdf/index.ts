import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { reportType, filters, userId } = await req.json();

    // Create export job
    const { data: job, error: jobError } = await supabase
      .from('export_jobs')
      .insert({
        user_id: userId,
        export_type: 'pdf',
        report_type: reportType,
        filters: filters,
        status: 'processing',
      })
      .select()
      .single();

    if (jobError) {
      throw jobError;
    }

    // Fetch data based on report type
    let reportData: any = {};
    
    switch (reportType) {
      case 'friction_summary':
        const { data: frictionData } = await supabase
          .from('friction_events')
          .select('*')
          .gte('timestamp', filters.startDate)
          .lte('timestamp', filters.endDate);
        reportData.events = frictionData || [];
        break;
      
      case 'journey_analysis':
        const { data: journeyData } = await supabase
          .from('user_journeys')
          .select('*')
          .eq('journey_id', filters.journeyId);
        reportData.journey = journeyData || [];
        break;
      
      case 'cohort_comparison':
        const { data: cohortData } = await supabase
          .from('user_cohorts')
          .select('*')
          .in('id', filters.cohortIds);
        reportData.cohorts = cohortData || [];
        break;
    }

    // Generate simple HTML report (in production, use a proper PDF library)
    const htmlContent = generateReportHTML(reportType, reportData);
    const pdfBuffer = new TextEncoder().encode(htmlContent); // Simplified: convert to buffer

    // Upload to storage
    const fileName = `${userId}/reports/${job.id}_${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('pdf-exports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get download URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdf-exports')
      .getPublicUrl(fileName);

    // Update job status
    await supabase
      .from('export_jobs')
      .update({
        status: 'completed',
        storage_path: fileName,
        download_url: publicUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId: job.id,
        downloadUrl: publicUrl 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateReportHTML(reportType: string, data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportType} Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>${reportType.replace('_', ' ').toUpperCase()}</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </body>
    </html>
  `;
}