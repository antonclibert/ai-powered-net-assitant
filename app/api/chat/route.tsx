import { streamText, tool, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Define tools for the network design assistant
const networkDesignTools = {
  saveNetworkDesign: tool({
    description: "Save the current network design to the database",
    inputSchema: z.object({
      projectName: z.string().describe("Name of the network project"),
      designData: z.any().describe("The network design configuration"),
      requirements: z.any().describe("Network requirements"),
      estimatedCost: z.number().describe("Estimated cost in USD"),
    }),
    execute: async ({ projectName, designData, requirements, estimatedCost }) => {
      // This will be executed when the tool is called
      return {
        success: true,
        message: `Network design "${projectName}" saved successfully`,
        estimatedCost,
      };
    },
  }),

  getDeviceRecommendations: tool({
    description: "Get recommended devices based on network requirements",
    inputSchema: z.object({
      companySize: z.number().describe("Number of employees"),
      budget: z.number().describe("Budget in USD"),
      officeUsers: z.number().describe("Number of office users"),
      remoteUsers: z.number().describe("Number of remote users"),
    }),
    execute: async ({ companySize, budget, officeUsers, remoteUsers }) => {
      // Return device recommendations based on input
      return {
        recommendations: [
          {
            category: "Core Switches",
            devices: ["Cisco Catalyst 9200", "Dell PowerConnect"],
            estimatedCost: Math.ceil(budget * 0.25),
          },
          {
            category: "Security",
            devices: ["Fortinet FortiGate", "Cisco ASA"],
            estimatedCost: Math.ceil(budget * 0.20),
          },
          {
            category: "Wireless",
            devices: ["Cisco Aironet", "Ubiquiti UniFi"],
            estimatedCost: Math.ceil(budget * 0.15),
          },
        ],
      };
    },
  }),

  analyzeBudget: tool({
    description: "Analyze and provide budget recommendations for network infrastructure",
    inputSchema: z.object({
      totalBudget: z.number().describe("Total available budget in USD"),
      companySize: z.number().describe("Company size in employees"),
    }),
    execute: async ({ totalBudget, companySize }) => {
      const perEmployee = totalBudget / companySize;
      return {
        perEmployeeBudget: perEmployee,
        budgetAllocation: {
          coreInfrastructure: Math.ceil(totalBudget * 0.35),
          security: Math.ceil(totalBudget * 0.25),
          wireless: Math.ceil(totalBudget * 0.20),
          redundancy: Math.ceil(totalBudget * 0.20),
        },
        recommendation: perEmployee > 500 ? "Excellent budget for enterprise-grade solutions" : "Budget suitable for SME solutions",
      };
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { messages, conversationId, projectId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Get the user from the request context
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Build system prompt for network design assistant
    const systemPrompt = `You are an expert Network Design Assistant. Your role is to help users design robust, scalable, and secure network infrastructure.

You have access to tools to:
- Save network designs to the database
- Get device recommendations based on requirements
- Analyze budgets and provide allocation recommendations

When helping users:
1. Ask clarifying questions about their requirements (company size, budget, users, etc.)
2. Provide specific device recommendations
3. Consider redundancy, security, and scalability
4. Estimate costs and ROI
5. Suggest best practices for their specific scenario

Always be professional, technical yet accessible, and provide actionable recommendations.`;

    // Convert messages to the format expected by streamText
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      messages: modelMessages,
      tools: networkDesignTools,
      maxSteps: 5,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Save the conversation message to database if conversationId is provided
    if (conversationId && token) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userMessage = messages[messages.length - 1];
        await supabase.from("chat_messages").insert([
          {
            conversation_id: conversationId,
            user_id: user.id,
            role: "user",
            content: userMessage.content,
          },
        ]);
      }
    }

    // Return the stream response
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
