// Prompt enhancement and reconstruction logic
export interface EnhancedPrompt {
  originalQuery: string
  reconstructedPrompt: string
  researchAreas: string[]
  actionableContext: string
  businessContext?: string
}

export class PromptEnhancer {
  static async enhancePrompt(
    userQuery: string,
    conversationHistory: any[] = [],
    userProfile?: any,
  ): Promise<EnhancedPrompt> {
    // Extract business context from conversation history
    const businessContext = this.extractBusinessContext(conversationHistory, userProfile)

    // Identify the type of legal query
    const queryType = this.identifyQueryType(userQuery)

    // Determine research areas needed
    const researchAreas = this.identifyResearchAreas(userQuery, queryType)

    // Build actionable context requirements
    const actionableContext = this.buildActionableContext(queryType, businessContext)

    // Reconstruct the prompt for comprehensive research
    const reconstructedPrompt = this.reconstructPrompt(
      userQuery,
      queryType,
      researchAreas,
      actionableContext,
      businessContext,
    )

    return {
      originalQuery: userQuery,
      reconstructedPrompt,
      researchAreas,
      actionableContext,
      businessContext,
    }
  }

  private static extractBusinessContext(conversationHistory: any[], userProfile?: any): string {
    let context = ""

    // Extract business type, industry, size from conversation
    const businessKeywords = [
      "LLC",
      "Corporation",
      "Partnership",
      "Sole Proprietorship",
      "startup",
      "small business",
      "restaurant",
      "retail",
      "tech company",
      "employees",
      "contractors",
      "customers",
      "vendors",
    ]

    const recentMessages = conversationHistory.slice(-10)
    const businessMentions = recentMessages
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content)
      .join(" ")
      .toLowerCase()

    const foundKeywords = businessKeywords.filter((keyword) => businessMentions.includes(keyword.toLowerCase()))

    if (foundKeywords.length > 0) {
      context = `Business context: ${foundKeywords.join(", ")}`
    }

    return context
  }

  private static identifyQueryType(query: string): string {
    const queryLower = query.toLowerCase()

    const queryTypes = {
      contract: ["contract", "agreement", "terms", "clause", "negotiate"],
      employment: ["employee", "hire", "fire", "wage", "overtime", "discrimination"],
      formation: ["llc", "corporation", "business formation", "incorporate", "entity"],
      compliance: ["compliance", "regulation", "license", "permit", "requirement"],
      intellectual_property: ["trademark", "copyright", "patent", "ip", "brand"],
      dispute: ["dispute", "lawsuit", "legal action", "sue", "court"],
      tax: ["tax", "irs", "deduction", "filing", "tax law"],
      real_estate: ["lease", "rent", "property", "landlord", "commercial space"],
    }

    for (const [type, keywords] of Object.entries(queryTypes)) {
      if (keywords.some((keyword) => queryLower.includes(keyword))) {
        return type
      }
    }

    return "general"
  }

  private static identifyResearchAreas(query: string, queryType: string): string[] {
    const baseResearchAreas = {
      contract: [
        "Current contract law standards",
        "Industry-specific contract requirements",
        "Recent legal precedents",
        "State-specific contract regulations",
        "Enforceability requirements",
      ],
      employment: [
        "Current employment law updates",
        "State and federal wage requirements",
        "Anti-discrimination laws",
        "Worker classification rules",
        "Required employment policies",
      ],
      formation: [
        "Business entity comparison",
        "State filing requirements",
        "Tax implications by entity type",
        "Liability protection analysis",
        "Ongoing compliance obligations",
      ],
      compliance: [
        "Industry-specific regulations",
        "Federal and state requirements",
        "Licensing and permit needs",
        "Penalty and enforcement actions",
        "Compliance timeline requirements",
      ],
      intellectual_property: [
        "Trademark search and registration",
        "Copyright protection scope",
        "Patent eligibility requirements",
        "IP enforcement mechanisms",
        "International IP considerations",
      ],
      dispute: [
        "Alternative dispute resolution options",
        "Litigation timeline and costs",
        "Settlement negotiation strategies",
        "Evidence preservation requirements",
        "Statute of limitations",
      ],
      general: [
        "Relevant legal framework",
        "Current law and regulations",
        "Practical implementation steps",
        "Risk assessment factors",
        "Professional consultation needs",
      ],
    }

    return baseResearchAreas[queryType] || baseResearchAreas["general"]
  }

  private static buildActionableContext(queryType: string, businessContext: string): string {
    return `
Provide action-ready guidance that includes:
1. Immediate steps the user can take today
2. Specific documents or forms needed
3. Timeline for completion
4. Potential risks and how to mitigate them
5. When to consult with an attorney
6. Cost estimates where applicable
7. Resources and tools for implementation

Business context: ${businessContext}
Query type: ${queryType}

Format the response with clear action items, deadlines, and next steps.
`
  }

  private static reconstructPrompt(
    originalQuery: string,
    queryType: string,
    researchAreas: string[],
    actionableContext: string,
    businessContext: string,
  ): string {
    return `
As an expert legal advisor with access to current legal information, please conduct comprehensive research and provide action-ready guidance for this business's legal question.

ORIGINAL QUESTION: "${originalQuery}"

RESEARCH REQUIREMENTS:
Please research and incorporate current and relevant local, state, and federal laws about:
${researchAreas.map((area) => `• ${area}`).join("\n")} If location is not specified, ask the user to provide that

CONTEXT:
${businessContext}
Query Category: ${queryType}

RESPONSE REQUIREMENTS:
${actionableContext}

Please provide a comprehensive response that:
1. Addresses the specific legal question with current, accurate information
2. Includes relevant laws, regulations, and recent updates
3. Provides step-by-step actionable guidance
4. Identifies potential risks and mitigation strategies
5. Specifies when professional legal counsel is recommended
6. Includes relevant forms, documents, or resources
7. Provides realistic timelines and cost estimates

Format your response with clear sections:
- IMMEDIATE ACTION ITEMS
- STEP-BY-STEP PROCESS
- LEGAL REQUIREMENTS & COMPLIANCE
- RISK ASSESSMENT
- RESOURCES & FORMS NEEDED
- WHEN TO CONSULT AN ATTORNEY
- ESTIMATED TIMELINE & COSTS
- SOURCES CITED AND SEARCH PROMPT USED

Ensure all advice is current, practical, and immediately actionable for a small business owner.
`
  }
}
