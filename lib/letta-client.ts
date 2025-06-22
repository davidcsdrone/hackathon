// Simplified Letta client for future use when endpoints are working
export const AGENT_ID = process.env.LETTA_AGENT_ID!
export const API_KEY = process.env.LETTA_API_KEY!

// Test function to check Letta connectivity with detailed debugging
export async function testLettaConnection() {
  console.log("=== Letta Connection Test ===")
  console.log("Agent ID:", AGENT_ID)
  console.log("API Key present:", !!API_KEY)
  console.log("API Key length:", API_KEY?.length || 0)

  if (!AGENT_ID || !API_KEY) {
    return {
      success: false,
      error: "Missing LETTA_AGENT_ID or LETTA_API_KEY environment variables",
      details: {
        hasAgentId: !!AGENT_ID,
        hasApiKey: !!API_KEY,
      },
    }
  }

  // Test different possible endpoints and methods
  const testCases = [
    {
      name: "GET Agent Info",
      url: `https://api.letta.com/v1/agents/${AGENT_ID}`,
      method: "GET",
      body: null,
    },
    {
      name: "POST Messages",
      url: `https://api.letta.com/v1/agents/${AGENT_ID}/messages`,
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    },
    {
      name: "POST Chat",
      url: `https://api.letta.com/v1/agents/${AGENT_ID}/chat`,
      method: "POST",
      body: JSON.stringify({
        message: "Hello",
      }),
    },
    {
      name: "POST Send",
      url: `https://api.letta.com/v1/agents/${AGENT_ID}/send`,
      method: "POST",
      body: JSON.stringify({
        message: "Hello",
      }),
    },
  ]

  const results = []

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`)

      const response = await fetch(testCase.url, {
        method: testCase.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: testCase.body,
      })

      const responseText = await response.text()
      let responseData

      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = responseText
      }

      results.push({
        name: testCase.name,
        url: testCase.url,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        response: responseData,
        headers: Object.fromEntries(response.headers.entries()),
      })

      console.log(`${testCase.name}: ${response.status} ${response.statusText}`)

      if (response.ok) {
        console.log("✅ Success with:", testCase.name)
        break
      }
    } catch (error) {
      results.push({
        name: testCase.name,
        url: testCase.url,
        success: false,
        error: error.message,
      })
      console.log(`${testCase.name}: Error -`, error.message)
    }
  }

  const hasSuccess = results.some((r) => r.success)

  return {
    success: hasSuccess,
    error: hasSuccess ? null : "All Letta endpoints failed",
    results,
    agentId: AGENT_ID,
    timestamp: new Date().toISOString(),
  }
}
