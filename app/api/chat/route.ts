import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { PromptEnhancer } from "@/lib/prompt-enhancer"

export async function POST(req: Request) {
  const { messages } = await req.json()

  console.log("Chat API called with enhanced prompt reconstruction")

  // Check if Google API key is available
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY")
    return new Response(
      JSON.stringify({
        error:
          "Google AI API key not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  try {
    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1]

    if (latestUserMessage?.role === "user") {
      console.log("Enhancing user prompt:", latestUserMessage.content.substring(0, 100) + "...")

      // Enhance the prompt using our intelligent agent
      const enhancedPrompt = await PromptEnhancer.enhancePrompt(
        latestUserMessage.content,
        messages.slice(0, -1), // Previous conversation history
      )

      console.log("Enhanced prompt research areas:", enhancedPrompt.researchAreas)
      console.log("Business context:", enhancedPrompt.businessContext)

      // Replace the user's message with the enhanced version
      const enhancedMessages = [
        ...messages.slice(0, -1),
        {
          ...latestUserMessage,
          content: enhancedPrompt.reconstructedPrompt,
        },
      ]

      // Use Google Gemini with enhanced system prompt for research and action-ready responses
      const result = await streamText({
        model: google("gemini-1.5-pro"),
        system: `You are an expert legal research assistant and advisor with access to comprehensive legal databases and current legal information. You specialize in providing action-ready legal guidance for small businesses.

CORE CAPABILITIES:
- Conduct thorough legal research using current laws and regulations
- Analyze business-specific legal requirements
- Provide step-by-step actionable guidance
- Identify risks and mitigation strategies
- Recommend specific forms, documents, and resources
- Determine when professional legal counsel is required

RESEARCH APPROACH:
1. Research current federal and state laws relevant to the query
2. Identify industry-specific requirements and best practices
3. Analyze recent legal developments and precedents
4. Consider practical implementation challenges
5. Assess compliance requirements and deadlines

RESPONSE FORMAT:
Structure all responses with clear, actionable sections:
- **IMMEDIATE ACTION ITEMS** (what to do today)
- **STEP-BY-STEP PROCESS** (detailed implementation)
- **LEGAL REQUIREMENTS** (compliance obligations)
- **RISK ASSESSMENT** (potential issues and solutions)
- **RESOURCES NEEDED** (forms, documents, tools)
- **PROFESSIONAL CONSULTATION** (when to hire an attorney)
- **TIMELINE & COSTS** (realistic expectations)

IMPORTANT GUIDELINES:
- Always provide current, researched information
- Include specific legal citations when relevant
- Offer practical, immediately actionable advice
- Identify potential risks and how to address them
- Recommend professional consultation for complex matters
- Provide realistic timelines and cost estimates
- Include relevant forms, templates, and resources

Remember: Provide comprehensive, research-backed guidance that requires no further research from the user.`,
        messages: enhancedMessages,
      })

      return result.toDataStreamResponse()
    } else {
      // For non-user messages, use standard processing
      const result = await streamText({
        model: google("gemini-1.5-pro"),
        system: `You are a knowledgeable AI legal advisor specializing in small business law. Provide helpful, accurate legal information and guidance while being clear that you're not providing formal legal advice.`,
        messages,
      })

      return result.toDataStreamResponse()
    }
  } catch (error) {
    console.error("Error in enhanced chat API:", error)

    return new Response(
      JSON.stringify({
        error: "Error processing request. Please check your API configuration.",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
