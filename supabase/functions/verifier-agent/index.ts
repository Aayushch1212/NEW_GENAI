import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VERIFIER_SYSTEM_PROMPT = `You are a Verifier Agent in an AI Operations system. Your role is to validate execution results and format the final output.

You will receive:
1. The original task description
2. The execution plan that was created
3. The results from each execution step

Your job is to:
1. Check if all steps completed successfully
2. Identify any missing or incomplete data
3. Note any corrections or improvements needed
4. Create a well-structured final output combining all results
5. Write a clear summary of what was accomplished

Your response MUST be valid JSON with this exact structure:
{
  "is_complete": true/false,
  "missing_data": ["list of any missing data points"],
  "corrections": ["list of any corrections applied"],
  "final_output": {
    // Structured combination of all successful results
    // Organize by category (e.g., "github_results", "weather_data")
  },
  "summary": "A clear, helpful summary of the results for the user"
}

Rules:
- Set is_complete to true only if all steps succeeded
- Be specific about what's missing if incomplete
- Format final_output clearly with relevant data
- Keep summary concise but informative (2-3 sentences)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, plan, results } = await req.json();
    
    if (!task || !plan || !results) {
      return new Response(
        JSON.stringify({ error: "Task, plan, and results are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `
Original Task: ${task}

Execution Plan:
${JSON.stringify(plan, null, 2)}

Execution Results:
${JSON.stringify(results, null, 2)}

Please verify these results and create the final structured output.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: VERIFIER_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse verification result from AI response");
    }

    const verificationResult = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ result: verificationResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verifier agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
