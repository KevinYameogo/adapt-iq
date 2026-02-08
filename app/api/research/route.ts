import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_TAVILY_API_KEY;
    
    if (!apiKey) {
      console.warn("[API] TAVILY_API_KEY not configured, skipping research");
      return NextResponse.json({ 
        results: [],
        message: "Research disabled - API key not configured" 
      });
    }

    console.log(`[API] /api/research: Searching for "${query}"`);

    // Call Tavily API
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
        include_domains: [],
        exclude_domains: []
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Format results
    const formattedResults = {
      answer: data.answer || "",
      sources: (data.results || []).map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score
      }))
    };

    console.log(`[API] /api/research: Found ${formattedResults.sources.length} sources`);

    return NextResponse.json(formattedResults);
  } catch (error: any) {
    console.error("[API] Research error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Research failed",
        results: [],
        message: "Continuing without research data"
      },
      { status: 200 } // Return 200 to allow graceful degradation
    );
  }
}
