import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// GitHub Search Tool
async function githubSearch(params: { query: string; limit?: number }) {
  const { query, limit = 5 } = params;
  
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AI-Ops-Assistant",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: {
        total_count: data.total_count,
        repositories: data.items.map((repo: any) => ({
          name: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count,
          language: repo.language,
          url: repo.html_url,
          topics: repo.topics?.slice(0, 5) || [],
          updated_at: repo.updated_at,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "GitHub search failed",
    };
  }
}

// Weather Tool (using Open-Meteo - free, no API key needed)
async function weatherGet(params: { city: string }) {
  const { city } = params;
  
  try {
    // First, geocode the city
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding error: ${geoResponse.status}`);
    }
    
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City not found: ${city}`);
    }
    
    const location = geoData.results[0];
    const { latitude, longitude } = location;
    
    // Get weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=kmh`
    );
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    
    // Map weather codes to descriptions
    const weatherCodes: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    
    return {
      success: true,
      data: {
        city: location.name,
        country: location.country,
        coordinates: { lat: latitude, lon: longitude },
        temperature: {
          current: current.temperature_2m,
          feels_like: current.apparent_temperature,
          unit: "°C",
        },
        conditions: weatherCodes[current.weather_code] || "Unknown",
        humidity: current.relative_humidity_2m,
        wind: {
          speed: current.wind_speed_10m,
          direction: current.wind_direction_10m,
          unit: "km/h",
        },
        timestamp: current.time,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Weather fetch failed",
    };
  }
}

// Tool registry
const tools: Record<string, (params: any) => Promise<{ success: boolean; data?: any; error?: string }>> = {
  github_search: githubSearch,
  weather_get: weatherGet,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { step } = await req.json();
    
    if (!step || !step.tool || !step.parameters) {
      return new Response(
        JSON.stringify({ error: "Invalid step format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toolFn = tools[step.tool];
    
    if (!toolFn) {
      return new Response(
        JSON.stringify({ 
          result: {
            tool: step.tool,
            success: false,
            error: `Unknown tool: ${step.tool}`,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute the tool with retry logic
    let result;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      result = await toolFn(step.parameters);
      if (result.success) break;
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }

    return new Response(
      JSON.stringify({
        result: {
          tool: step.tool,
          ...result,
        },
        step_number: step.step_number,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Executor agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
