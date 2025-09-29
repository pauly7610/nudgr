import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frictionData, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (analysisType) {
      case "journey":
        systemPrompt = "You are a UX expert specializing in user journey analysis. Analyze friction points and provide actionable recommendations.";
        userPrompt = `Analyze this journey friction data and provide insights:\n${JSON.stringify(frictionData, null, 2)}\n\nProvide: 1) Top 3 friction points, 2) Impact assessment, 3) Specific recommendations to reduce friction.`;
        break;
      
      case "cohort":
        systemPrompt = "You are a data analyst specializing in user cohort behavior. Identify patterns and suggest improvements.";
        userPrompt = `Analyze this cohort friction data:\n${JSON.stringify(frictionData, null, 2)}\n\nProvide: 1) Key behavioral patterns, 2) Cohort-specific friction points, 3) Targeted optimization strategies.`;
        break;
      
      case "element":
        systemPrompt = "You are a UI/UX specialist focusing on element-level interactions. Identify problematic elements and suggest fixes.";
        userPrompt = `Analyze these element interaction issues:\n${JSON.stringify(frictionData, null, 2)}\n\nProvide: 1) Most problematic elements, 2) Root causes, 3) Design and technical fixes.`;
        break;
      
      default:
        systemPrompt = "You are a comprehensive UX friction analyst. Analyze the data and provide strategic insights.";
        userPrompt = `Analyze this friction data:\n${JSON.stringify(frictionData, null, 2)}\n\nProvide comprehensive insights and actionable recommendations.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-friction function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
