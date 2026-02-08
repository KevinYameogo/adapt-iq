import OpenAI, { toFile } from "openai";

// Initialize OpenAI client
// Note: In client-side code, use dangerouslyAllowBrowser: true only if you understand the risks
// Ideally, API calls should be routed through a backend endpoint to protect the key.
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  timeout: 60000, // 60 seconds
  maxRetries: 3,
});

export const analyzeEngagement = async (
  transcript: string,
  slideText: string
) => {
  try {
    const prompt = `
      You are an expert presentation coach analyzing a live speech.
      I will provide:
      1. The speaker's transcript: "${transcript}"
      2. The text on the current slide: "${slideText}"

      Your task is to analyze the engagement level and provide concise, actionable suggestions.
      
      CRITICAL: If the speaker gives a direct COMMAND like "delete slide 1", "add a slide about sales", or "skip this slide", you MUST set:
      - actionType: The corresponding action (e.g. "delete_slide", "insert_slide", "skip_slide")
      - suggestion: The parameter for the action (e.g. "0" for slide 1, or the topic for insert)
      - status: "Command Detected"

      Return a JSON object with:
      - engagementScore (integer 1-100)
      - status (string: "Engaged", "Confused", "Losing Focus", "Neutral", "Command Detected")
      - suggestion (string: A brief, actionable tip OR the command parameter. Max 15 words.)
      - actionType (string: "insert_slide", "simplify_text", "skip_ahead", "delete_slide", "none")
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or gpt-3.5-turbo
      messages: [
        {
          role: "system",
          content: "You are a helpful presentation assistant.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing engagement:", error);
    return null;
  }
};

export const transcribeAudio = async (audioBlob: Blob) => {
  console.log("[lib/ai] transcribeAudio: Preparing file...");
  try {
    if (audioBlob.size === 0) {
      console.warn("[lib/ai] transcribeAudio: Received empty blob.");
      return null;
    }

    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    const file = await toFile(buffer, "speech.webm", { type: "audio/webm" });
    console.log(
      `[lib/ai] transcribeAudio: Calling OpenAI Whisper (Size: ${file.size} bytes)...`
    );

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    console.log("[lib/ai] transcribeAudio: Success.");
    return response.text;
  } catch (error: any) {
    console.error("[lib/ai] transcribeAudio error details:", {
      name: error.name,
      message: error.message,
      type: error.type,
      cause: error.cause,
    });
    return null;
  }
};

/**
 * Research a topic using web search to find statistics and facts
 */
/**
 * Research a topic using web search to find statistics and facts
 */
export const researchTopic = async (topic: string): Promise<string> => {
  try {
    console.log(`[lib/ai] Researching topic: "${topic}"`);
    
    const apiKey = process.env.NEXT_PUBLIC_TAVILY_API_KEY;
    if (!apiKey) {
      console.warn("[lib/ai] TAVILY_API_KEY not configured, skipping research");
      return "";
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: topic,
        search_depth: "basic",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
        include_domains: [],
        exclude_domains: []
      }),
    });

    if (!response.ok) {
      console.warn(`[lib/ai] Research API failed: ${response.statusText}, continuing without research`);
      return "";
    }

    const data = await response.json();
    
    // Tavily response format check
    const results = data.results || [];
    
    if (results.length === 0 && !data.answer) {
      console.log("[lib/ai] No research results found");
      return "";
    }

    // Format research results for inclusion in prompt
    let researchContext = `### 🔍 Research: ${topic}\n\n`;
    
    if (data.answer) {
      researchContext += `**Executive Summary:**\n${data.answer}\n\n`;
    }
    
    researchContext += `**Key Findings & Citations:**\n`;
    results.slice(0, 3).forEach((source: any, idx: number) => {
      researchContext += `${idx + 1}. **${source.title}**\n   - [View Source](${source.url})\n   - ${source.content.substring(0, 250)}...\n\n`;
    });

    console.log(`[lib/ai] Research complete: ${results.length} sources found`);
    return researchContext;
  } catch (error) {
    console.error("[lib/ai] Research error:", error);
    return "";
  }
};

export const generateDeckStructure = async (
  notes: string,
  structureType: string = "Standard",
  enableResearch: boolean = false
) => {
  try {
    let researchContext = "";
    
    // If research is enabled, perform web search on the main topic
    if (enableResearch) {
      console.log("[lib/ai] Research enabled, gathering context...");
      // Extract main topic from notes (first 100 chars as a simple heuristic)
      const mainTopic = notes.substring(0, 100).trim();
      researchContext = await researchTopic(mainTopic);
    }

    const prompt = `
      You are an expert Presentation Architect.
      
      TASK:
      Convert the following raw notes/outline into a structured presentation deck following the "${structureType}" narrative structure.
      
      NARRATIVE GUIDANCE:
      - "Standard": A clear, logical summary.
      - "Hero's Journey": Call to Adventure -> Challenge -> Transformation -> Return.
      - "Pitch Deck": Problem -> Solution -> Market -> Business Model -> Team.
      - "Problem-Solution": Agitate the problem, then solve it.
      - "Crimson Impact": Bold, assertive narrative with strong calls to action.
      - "Burnt Orange": Warm, engaging storytelling with emotional resonance.

      INPUT NOTES:
      "${notes}"
      ${researchContext}

      ${enableResearch ? `
      RESEARCH INTEGRATION:
      - Use the research findings above to back up claims in speaker notes
      - Include specific statistics and facts where relevant
      - Cite sources in speaker notes using format: "According to [Source Name], [fact/statistic]"
      - Make speaker notes data-driven and credible
      ` : ''}

      OUTPUT FORMAT:
      Return a JSON object with a key "slides" containing an array of slide objects.
      Each slide object must have:
      - title: string (Punchy header, max 10 words)
      - bullets: string[] (Detailed key points, min 3 per slide. Each bullet should be a full, meaningful sentence of 10-20 words. No short fragmented lists.)
      - notes: string (Comprehensive speaker notes for the presenter${enableResearch ? ', including relevant statistics and citations from research' : ''}, tone: professional)
      - visualMetaphor: string (A short description of an image that would fit this slide)

      Generate 5-8 slides total to ensure a complete narrative.
    `;

    console.log(`[lib/ai] Generating deck structure: ${structureType}${enableResearch ? ' (with research)' : ''}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class presentation designer. You always provide detailed, high-quality slide content that feels professional and informative." + 
                   (enableResearch ? " When research data is provided, you expertly integrate statistics and facts into speaker notes with proper citations." : ""),
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating deck:", error);
    return null;
  }
};

export const auditSlide = async (slideText: string) => {
  try {
    console.log("[lib/ai] Auditing slide text...");
    
    const prompt = `
      You are a senior presentation coach.
      Analyze the following slide text for clarity, impact, and brevity:
      "${slideText}"

      NOTE ON STRUCTURE:
      - Lines starting with "• " or "[BULLETED]" are already bulleted in the slide.
      - DO NOT suggest adding bullets if they are already present. Use this information to avoid redundant advice.

      Identify 3 specific improvements.
      
      Return a JSON object with:
      - score: number (1-100)
      - summary: string (1 sentence overall feedback)
      - suggestions: Array<{
          type: "clarity" | "brevity" | "impact",
          text: string (The specific suggestion),
          original: string (The specific text substring to change, if applicable),
          replacement: string (The suggested new text, if applicable)
        }>
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful presentation coach. You provide constructive, specific feedback to improve slide content.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error auditing slide:", error);
    return null;
  }
};
