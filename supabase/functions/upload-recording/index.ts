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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    const userId = formData.get('userId') as string;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (!file || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to storage
    const fileName = `${userId}/${sessionId}_${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('session-recordings')
      .upload(fileName, file, {
        contentType: 'video/webm',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('session-recordings')
      .getPublicUrl(fileName);

    // Insert metadata
    const { data: recordingData, error: dbError } = await supabase
      .from('session_recordings')
      .insert({
        session_id: sessionId,
        user_id: userId,
        storage_path: fileName,
        recording_url: publicUrl,
        duration_seconds: metadata.duration || 0,
        page_url: metadata.pageUrl || '',
        user_agent: metadata.userAgent || '',
        friction_count: metadata.frictionCount || 0,
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return new Response(
      JSON.stringify({ success: true, recording: recordingData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading recording:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});